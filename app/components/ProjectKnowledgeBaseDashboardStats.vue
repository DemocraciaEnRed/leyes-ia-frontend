<script setup>
const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true
  }
})

const isLoading = ref(true)
const knowledgeBase = ref(null)
const ready = ref(false)
const errorMessage = ref('')

const refresh = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await $authFetch(`/api/backend/projects/${props.projectId}/knowledge-base/ready`)
    ready.value = Boolean(response?.ready)
    knowledgeBase.value = response?.knowledgeBase || null
  } catch (error) {
    errorMessage.value = 'No se pudo cargar el estado de la base de conocimiento.'
    knowledgeBase.value = null
    ready.value = false
  } finally {
    isLoading.value = false
  }
}

defineExpose({ refresh })

onMounted(async () => {
  await refresh()
})

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  const numeric = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(numeric)) return '—'
  return new Intl.NumberFormat('es-AR').format(numeric)
}

const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

const phaseLabelMap = {
  BATCH_JOB_PHASE_UNKNOWN: 'Desconocida',
  BATCH_JOB_PHASE_PENDING: 'Pendiente',
  BATCH_JOB_PHASE_RUNNING: 'En ejecución',
  BATCH_JOB_PHASE_SUCCEEDED: 'Exitosa',
  BATCH_JOB_PHASE_FAILED: 'Fallida',
  BATCH_JOB_PHASE_ERROR: 'Error',
  BATCH_JOB_PHASE_CANCELLED: 'Cancelada'
}

const statusLabelMap = {
  INDEX_JOB_STATUS_UNKNOWN: 'Desconocido',
  INDEX_JOB_STATUS_PARTIAL: 'Parcial',
  INDEX_JOB_STATUS_IN_PROGRESS: 'En progreso',
  INDEX_JOB_STATUS_COMPLETED: 'Completado',
  INDEX_JOB_STATUS_FAILED: 'Fallido',
  INDEX_JOB_STATUS_NO_CHANGES: 'Completado sin cambios',
  INDEX_JOB_STATUS_PENDING: 'Pendiente',
  INDEX_JOB_STATUS_CANCELLED: 'Cancelado'
}

const phaseColorMap = {
  BATCH_JOB_PHASE_UNKNOWN: 'neutral',
  BATCH_JOB_PHASE_PENDING: 'warning',
  BATCH_JOB_PHASE_RUNNING: 'info',
  BATCH_JOB_PHASE_SUCCEEDED: 'success',
  BATCH_JOB_PHASE_FAILED: 'error',
  BATCH_JOB_PHASE_ERROR: 'error',
  BATCH_JOB_PHASE_CANCELLED: 'neutral'
}

const statusColorMap = {
  INDEX_JOB_STATUS_UNKNOWN: 'neutral',
  INDEX_JOB_STATUS_PARTIAL: 'warning',
  INDEX_JOB_STATUS_IN_PROGRESS: 'info',
  INDEX_JOB_STATUS_COMPLETED: 'success',
  INDEX_JOB_STATUS_FAILED: 'error',
  INDEX_JOB_STATUS_NO_CHANGES: 'success',
  INDEX_JOB_STATUS_PENDING: 'warning',
  INDEX_JOB_STATUS_CANCELLED: 'neutral'
}

const stats = computed(() => {
  const lastJob = knowledgeBase.value?.last_indexing_job || {}
  const readinessLabel = ready.value ? 'Lista' : 'No lista'
  const readinessColor = ready.value ? 'success' : 'warning'

  return [
    {
      title: 'Estado de la indexación',
      icon: 'lucide:activity',
      value: statusLabelMap[lastJob.status] || '—',
      badgeColor: readinessColor,
      badgeLabel: readinessLabel
    },
    {
      title: 'Fase del proceso',
      icon: 'lucide:layers',
      value: phaseLabelMap[lastJob.phase] || '—',
      badgeColor: phaseColorMap[lastJob.phase] || 'neutral'
    },
    {
      title: 'Fuentes de datos',
      icon: 'lucide:database',
      value: formatNumber(lastJob.total_datasources),
      badgeColor: 'primary'
    },
    {
      title: 'Tokens indexados',
      icon: 'lucide:braces',
      value: formatNumber(lastJob.total_tokens),
      badgeColor: 'primary'
    },
    {
      title: 'Última actualización',
      icon: 'lucide:clock',
      value: formatDateTime(lastJob.updated_at || lastJob.finished_at || lastJob.started_at),
      badgeColor: 'neutral',
      class: 'sm:col-span-2 lg:col-span-2'
    }
  ]
})
</script>
    
<template>
  <UPageGrid class="sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-3">
    <template v-if="isLoading">
      <UPageCard
        v-for="index in 5"
        :key="`loading-${index}`"
        icon="lucide:loader"
        title="Cargando"
        variant="subtle"
        :ui="{
          container: 'gap-y-1.5',
          wrapper: 'items-start',
          leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
          title: 'font-normal text-muted text-xs uppercase'
        }"
        class="hover:z-1"
      >
        <LoadingCard />
      </UPageCard>
    </template>

    <template v-else>
      <UPageCard
        v-for="(stat, index) in stats"
        :key="index"
        :icon="stat.icon"
        :title="stat.title"
        to="/legislador/hubs"
        variant="subtle"
        :ui="{
          container: 'gap-y-1.5',
          wrapper: 'items-start',
          leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
          title: 'font-normal text-muted text-xs uppercase'
        }"
        :class="[' hover:z-1', stat.class]"
      >
        <div class="flex items-center gap-2">
          <span class="text-2xl font-semibold text-highlighted">
            {{ stat.value }}
          </span>

          <UBadge
            :color="stat.badgeColor"
            variant="subtle"
            class="text-xs"
          >
            {{ stat.badgeLabel ?? (stat.value === '—' ? 'Sin datos' : 'Actualizado') }}
          </UBadge>
        </div>
      </UPageCard>
    </template>
  </UPageGrid>

  <UAlert
    v-if="errorMessage"
    class="mt-4"
    color="error"
    variant="subtle"
    :title="errorMessage"
  />
</template>
<script setup>
const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true
  }
})

const isLoading = ref(true)
const errorMessage = ref('')
const usage = ref(null)

const DAYS_RANGE = 30

const getDateRange = () => {
  const to = new Date()
  const from = new Date(to.getTime() - DAYS_RANGE * 24 * 60 * 60 * 1000)

  return {
    from: from.toISOString(),
    to: to.toISOString()
  }
}

const refresh = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { from, to } = getDateRange()

    usage.value = await $authFetch(`/api/backend/projects/${props.projectId}/manage/ai-usage`, {
      query: {
        from,
        to,
        interval: 'auto',
        limit: 15
      }
    })
  } catch (_error) {
    errorMessage.value = 'No se pudieron cargar las métricas de uso de IA.'
    usage.value = null
  } finally {
    isLoading.value = false
  }
}

defineExpose({ refresh })

onMounted(async () => {
  await refresh()
})

watch(() => props.projectId, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    await refresh()
  }
})

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—'
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value))
}

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '—'

  const numeric = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(numeric)) return '—'

  return new Intl.NumberFormat('es-AR').format(numeric)
}

const stats = computed(() => {
  const totals = usage.value?.totals || {}
  const resolvedInterval = usage.value?.filters?.resolvedInterval || 'day'
  const intervalLabel = resolvedInterval === 'day' ? 'Diario' : resolvedInterval

  return [{
    title: 'Tokens input',
    icon: 'lucide:arrow-down-circle',
    value: formatNumber(totals.inputTokens),
    badgeColor: 'info',
    badgeLabel: `${DAYS_RANGE} días`
  }, {
    title: 'Tokens output',
    icon: 'lucide:arrow-up-circle',
    value: formatNumber(totals.outputTokens),
    badgeColor: 'secondary',
    badgeLabel: intervalLabel
  }, {
    title: 'Tokens totales',
    icon: 'lucide:braces',
    value: formatNumber(totals.totalTokens),
    badgeColor: 'primary',
    badgeLabel: totals.events ? `${formatNumber(totals.events)} eventos` : 'Sin datos'
  }, {
    title: 'Costo IA estimado',
    icon: 'lucide:wallet-cards',
    value: formatCurrency(totals.estimatedCostUsd),
    badgeColor: 'warning',
    badgeLabel: 'Estimado'
  }]
})
</script>

<template>
  <UPageGrid class="sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-3">
    <template v-if="isLoading">
      <UPageCard
        v-for="index in 4"
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
        variant="subtle"
        :ui="{
          container: 'gap-y-1.5',
          wrapper: 'items-start',
          leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
          title: 'font-normal text-muted text-xs uppercase'
        }"
        class="hover:z-1"
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
            {{ stat.badgeLabel }}
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

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'admin'
})

const { user } = useAuth()

const isLoading = ref(true)
const errorMessage = ref('')
const usage = ref<any>(null)

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
    usage.value = await $authFetch('/api/backend/admin/ai-usage', {
      query: {
        from,
        to,
        interval: 'auto',
        limit: 20
      }
    })
  } catch (_error) {
    errorMessage.value = 'No se pudo cargar el dashboard de uso de IA.'
    usage.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await refresh()
})

const formatNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—'

  const numeric = typeof value === 'string' ? Number(value) : Number(value)
  if (Number.isNaN(numeric)) return '—'

  return new Intl.NumberFormat('es-AR').format(numeric)
}

const formatCurrencyUsd = (value: unknown) => {
  const numeric = typeof value === 'string' ? Number(value) : Number(value)
  if (Number.isNaN(numeric)) return '—'

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numeric)
}

type HeadlineBadgeColor = 'info' | 'secondary' | 'primary' | 'warning'
type HeadlineCard = {
  title: string
  icon: string
  value: string
  badgeColor: HeadlineBadgeColor
  badgeLabel: string
}

const headlineCards = computed(() => {
  const totals = usage.value?.totals || {}
  const intervalLabel = usage.value?.filters?.resolvedInterval || 'day'

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
    badgeLabel: `Intervalo ${intervalLabel}`
  }, {
    title: 'Tokens totales',
    icon: 'lucide:braces',
    value: formatNumber(totals.totalTokens),
    badgeColor: 'primary',
    badgeLabel: `${formatNumber(totals.events)} eventos`
  }, {
    title: 'Costo estimado',
    icon: 'lucide:wallet-cards',
    value: formatCurrencyUsd(totals.estimatedCostUsd),
    badgeColor: 'warning',
    badgeLabel: 'Estimado'
  }] as HeadlineCard[]
})

const topActions = computed(() => (usage.value?.byAction || []).slice(0, 8))
const topProjects = computed(() => (usage.value?.byProject || []).slice(0, 8))
const recentSeries = computed(() => (usage.value?.timeSeries?.buckets || []).slice(-10))
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">
        Dashboard IA (Admin)
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Bienvenido, {{ user?.fullName }}
      </p>
    </div>

    <UAlert
      color="primary"
      variant="soft"
      title="Acceso de administración"
      :description="`Viendo métricas globales de IA de los últimos ${DAYS_RANGE} días.`"
      icon="i-lucide-shield-check"
      class="mb-8"
    />

    <!-- Admin navigation -->
    <div class="mb-8 flex flex-wrap gap-3">
      <UButton
        to="/admin/legisladores"
        icon="i-lucide-landmark"
        color="neutral"
        variant="subtle"
      >
        Legisladores
      </UButton>
    </div>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="subtle"
      :title="errorMessage"
      class="mb-8"
    />

    <UPageGrid class="sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-3 mb-8">
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
        >
          <LoadingCard />
        </UPageCard>
      </template>

      <template v-else>
        <UPageCard
          v-for="(stat, index) in headlineCards"
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
        >
          <div class="flex items-center gap-2">
            <span class="text-2xl font-semibold text-highlighted">{{ stat.value }}</span>
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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UPageCard
        variant="subtle"
        class="lg:col-span-1"
      >
        <template #title>
          <h3 class="text-lg font-semibold">
            Por acción
          </h3>
        </template>

        <div class="space-y-3">
          <div
            v-for="row in topActions"
            :key="row.action"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-muted">{{ row.action }}</span>
            <span class="font-medium">{{ formatNumber(row.totalTokens) }} tokens</span>
          </div>
          <p
            v-if="!topActions.length"
            class="text-sm text-muted"
          >
            Sin datos
          </p>
        </div>
      </UPageCard>

      <UPageCard
        variant="subtle"
        class="lg:col-span-1"
      >
        <template #title>
          <h3 class="text-lg font-semibold">
            Top proyectos
          </h3>
        </template>

        <div class="space-y-3">
          <div
            v-for="row in topProjects"
            :key="`project-${row.projectId}`"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-muted truncate pr-3">{{ row.project?.name || `Proyecto ${row.projectId}` }}</span>
            <span class="font-medium">{{ formatNumber(row.totalTokens) }} tokens</span>
          </div>
          <p
            v-if="!topProjects.length"
            class="text-sm text-muted"
          >
            Sin datos
          </p>
        </div>
      </UPageCard>

      <UPageCard
        variant="subtle"
        class="lg:col-span-1"
      >
        <template #title>
          <h3 class="text-lg font-semibold">
            Serie temporal
          </h3>
        </template>

        <div class="space-y-2 text-sm">
          <div
            v-for="bucket in recentSeries"
            :key="bucket.start"
            class="flex items-center justify-between"
          >
            <span class="text-muted">{{ bucket.label }}</span>
            <span class="font-medium">{{ formatNumber(bucket.totalTokens) }} tk</span>
          </div>
          <p
            v-if="!recentSeries.length"
            class="text-sm text-muted"
          >
            Sin datos
          </p>
        </div>
      </UPageCard>
    </div>

    <p class="text-xs text-muted mt-6">
      * El costo se muestra como estimado según pricing público de tokens y puede variar.
    </p>
  </div>
</template>

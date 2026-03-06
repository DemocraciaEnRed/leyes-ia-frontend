<script setup lang="ts">
interface Props {
  surveyTitle?: string | null
  surveyAbout?: string | null
  surveyClosedAt?: string | null
  totalResponses: number
  totalQuestions: number
}

const props = withDefaults(defineProps<Props>(), {
  surveyTitle: null,
  surveyAbout: null,
  surveyClosedAt: null
})

const surveyStatus = computed(() => {
  if (!props.surveyClosedAt)
    return 'Activa'

  const closeDate = new Date(props.surveyClosedAt)
  if (Number.isNaN(closeDate.getTime()))
    return 'Activa'

  return closeDate.getTime() <= Date.now() ? 'Terminada' : 'Activa'
})

const surveyCloseDateText = computed(() => {
  if (!props.surveyClosedAt)
    return 'Sin fecha de cierre'

  const closeDate = new Date(props.surveyClosedAt)
  if (Number.isNaN(closeDate.getTime()))
    return 'Sin fecha de cierre'

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(closeDate)
})

const surveyStatusColor = computed(() => (surveyStatus.value === 'Activa' ? 'success' : 'neutral'))
</script>

<template>
  <UPageCard
    variant="subtle"
    class="w-full"
    :ui="{ container: 'space-y-4' }"
  >
    <h1 class="text-2xl font-semibold md:text-3xl">
      Resultados de la encuesta
    </h1>

    <p class="text-sm text-muted md:text-base">
      {{ surveyTitle || 'Resumen general de participación' }}
    </p>

    <p
      v-if="surveyAbout"
      class="text-sm text-toned"
    >
      {{ surveyAbout }}
    </p>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <UPageCard
        variant="subtle"
        :ui="{ container: 'space-y-1 py-3' }"
      >
        <p class="text-xs uppercase tracking-wide text-muted">
          Respuestas
        </p>
        <p class="text-2xl font-semibold text-highlighted">
          {{ totalResponses }}
        </p>
      </UPageCard>

      <UPageCard
        variant="subtle"
        :ui="{ container: 'space-y-1 py-3' }"
      >
        <p class="text-xs uppercase tracking-wide text-muted">
          Preguntas
        </p>
        <p class="text-2xl font-semibold text-highlighted">
          {{ totalQuestions }}
        </p>
      </UPageCard>

      <UPageCard
        variant="subtle"
        :ui="{ container: 'space-y-1 py-3' }"
      >
        <p class="text-xs uppercase tracking-wide text-muted">
          Estado
        </p>
        <div>
          <UBadge
            :color="surveyStatusColor"
            variant="subtle"
            size="lg"
          >
            {{ surveyStatus }}
          </UBadge>
        </div>
      </UPageCard>

      <UPageCard
        variant="subtle"
        :ui="{ container: 'space-y-1 py-3' }"
      >
        <p class="text-xs uppercase tracking-wide text-muted">
          Cierre
        </p>
        <p class="text-sm font-medium text-highlighted">
          {{ surveyCloseDateText }}
        </p>
      </UPageCard>
    </div>
  </UPageCard>
</template>
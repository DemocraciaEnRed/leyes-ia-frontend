<script setup lang="ts">
import type { VotePredictionPublicResponse, VotePrediction, VoteValue, ConfidenceLevel } from '~/shared/types/votePrediction'

const props = defineProps<{
  projectSlug: string
}>()

const { data, status } = await useFetch<VotePredictionPublicResponse>(
  `/api/backend/hub/projects/slug/${props.projectSlug}/vote-predictions`
)

const predictions = computed(() => data.value?.predictions || [])
const disclaimer = computed(() => data.value?.disclaimer || null)
const hasPredictions = computed(() => predictions.value.length > 0)

const voteConfig: Record<VoteValue, { label: string; color: 'success' | 'error' | 'warning' | 'neutral'; icon: string }> = {
  yes: { label: 'A favor', color: 'success', icon: 'lucide:thumbs-up' },
  no: { label: 'En contra', color: 'error', icon: 'lucide:thumbs-down' },
  abstain: { label: 'Abstención', color: 'neutral', icon: 'lucide:minus-circle' },
  divided: { label: 'Dividido', color: 'warning', icon: 'lucide:split' },
}

const confidenceConfig: Record<ConfidenceLevel, { label: string; color: 'success' | 'warning' | 'error' }> = {
  high: { label: 'Alta', color: 'success' },
  medium: { label: 'Media', color: 'warning' },
  low: { label: 'Baja', color: 'error' },
}

const expandedIds = ref<Set<number>>(new Set())
function toggleExpanded(id: number) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

// Summary stats
const voteBreakdown = computed(() => {
  const counts: Record<string, number> = { yes: 0, no: 0, abstain: 0, divided: 0 }
  for (const p of predictions.value) {
    const vote = p.contextualVote || p.theoreticalVote
    if (vote && counts[vote] !== undefined) {
      counts[vote]++
    }
  }
  return counts
})

function getDisplayVote(prediction: VotePrediction) {
  return prediction.contextualVote || prediction.theoreticalVote
}

function getDisplayConfidence(prediction: VotePrediction) {
  return prediction.contextualConfidence || prediction.theoreticalConfidence
}

function getDisplayJustification(prediction: VotePrediction) {
  return prediction.contextualJustification || prediction.theoreticalJustification
}
</script>

<template>
  <UPageSection
    v-if="hasPredictions"
    title="Predicción de votaciones por partido"
    description="Estimaciones generadas por inteligencia artificial sobre cómo votarían los partidos políticos sobre este proyecto."
  >
    <template #headline>
      <div class="text-5xl leading-none text-center">
        🗳️
      </div>
    </template>

    <!-- Disclaimer -->
    <UAlert
      icon="lucide:shield-alert"
      color="warning"
      variant="subtle"
      :description="disclaimer || 'Las predicciones son generadas por IA con carácter orientativo. No constituyen garantía de resultado de ninguna votación.'"
      class="mb-6"
    />

    <!-- Summary Bar -->
    <div class="flex items-center justify-center gap-6 mb-8 flex-wrap">
      <div v-for="(count, vote) in voteBreakdown" :key="vote" class="text-center">
        <div v-if="count > 0" class="flex flex-col items-center gap-1">
          <UBadge
            :color="voteConfig[vote as VoteValue]?.color || 'neutral'"
            variant="subtle"
            size="lg"
            class="px-4"
          >
            <span class="flex items-center gap-1.5">
              <UIcon :name="voteConfig[vote as VoteValue]?.icon" class="size-4" />
              {{ count }}
            </span>
          </UBadge>
          <span class="text-xs text-muted">{{ voteConfig[vote as VoteValue]?.label }}</span>
        </div>
      </div>
    </div>

    <!-- Prediction Cards -->
    <div class="grid gap-4 md:grid-cols-2">
      <UPageCard
        v-for="prediction in predictions"
        :key="prediction.id"
        variant="outline"
        class="border-primary/20 cursor-pointer transition-all hover:shadow-md"
        @click="toggleExpanded(prediction.id)"
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <UAvatar
              :alt="prediction.politicalParty?.name || 'Partido'"
              :src="prediction.politicalParty?.logoUrl || undefined"
              size="md"
            />
            <div>
              <h3 class="font-semibold">{{ prediction.politicalParty?.name || 'Partido' }}</h3>
              <p v-if="prediction.politicalParty?.shortName" class="text-xs text-muted">
                {{ prediction.politicalParty.shortName }}
              </p>
            </div>
          </div>

          <div class="flex flex-col items-end gap-1">
            <UBadge
              v-if="getDisplayVote(prediction)"
              :color="voteConfig[getDisplayVote(prediction)!]?.color || 'neutral'"
              variant="subtle"
            >
              <span class="flex items-center gap-1.5">
                <UIcon :name="voteConfig[getDisplayVote(prediction)!]?.icon" class="size-4" />
                {{ voteConfig[getDisplayVote(prediction)!]?.label }}
              </span>
            </UBadge>
            <UBadge
              v-if="getDisplayConfidence(prediction)"
              :color="confidenceConfig[getDisplayConfidence(prediction)!]?.color || 'neutral'"
              variant="subtle"
              size="xs"
            >
              Confianza: {{ confidenceConfig[getDisplayConfidence(prediction)!]?.label }}
            </UBadge>
          </div>
        </div>

        <!-- Differs warning -->
        <UAlert
          v-if="prediction.contextualDiffersFromTheoretical"
          icon="lucide:alert-triangle"
          color="warning"
          variant="subtle"
          class="mt-3"
        >
          <template #description>
            <span class="text-xs">{{ prediction.contextualReasonForDifference || 'La evidencia contextual sugiere una postura diferente a la predicción teórica.' }}</span>
          </template>
        </UAlert>

        <!-- Expanded content -->
        <div v-if="expandedIds.has(prediction.id)" class="mt-4 space-y-4" @click.stop>
          <!-- Justification -->
          <div class="prose prose-sm max-w-none p-3 rounded-lg bg-elevated border border-default">
            <MDC :value="getDisplayJustification(prediction) || 'Sin justificación disponible'" />
          </div>

          <!-- Contextual sources -->
          <div v-if="prediction.contextualSources && prediction.contextualSources.length > 0">
            <p class="text-xs text-muted font-medium mb-2">Fuentes consultadas:</p>
            <div class="space-y-1">
              <div v-for="(source, i) in prediction.contextualSources" :key="i" class="text-sm flex items-center gap-2">
                <UIcon name="lucide:external-link" class="size-3 shrink-0 text-primary" />
                <a
                  v-if="source.url"
                  :href="source.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline truncate"
                  @click.stop
                >
                  {{ source.title }}
                </a>
                <span v-else class="text-muted">{{ source.title }}</span>
              </div>
            </div>
          </div>

          <!-- Theoretical profile points -->
          <div v-if="prediction.theoreticalSources && prediction.theoreticalSources.length > 0 && !prediction.contextualVote">
            <p class="text-xs text-muted font-medium mb-2">Puntos del perfil relevantes:</p>
            <ul class="text-sm space-y-1 list-disc list-inside text-muted">
              <li v-for="(source, i) in prediction.theoreticalSources" :key="i">{{ source.title }}</li>
            </ul>
          </div>

          <!-- Both predictions comparison -->
          <div v-if="prediction.contextualVote && prediction.theoreticalVote" class="flex gap-3 flex-wrap">
            <UBadge variant="outline" color="neutral" size="xs">
              <span class="flex items-center gap-1">
                <UIcon name="lucide:book-open" class="size-3" />
                Teórico:
                <UIcon :name="voteConfig[prediction.theoreticalVote]?.icon" class="size-3" />
                {{ voteConfig[prediction.theoreticalVote]?.label }}
              </span>
            </UBadge>
            <UBadge variant="outline" color="neutral" size="xs">
              <span class="flex items-center gap-1">
                <UIcon name="lucide:globe" class="size-3" />
                Contextual:
                <UIcon :name="voteConfig[prediction.contextualVote]?.icon" class="size-3" />
                {{ voteConfig[prediction.contextualVote]?.label }}
              </span>
            </UBadge>
          </div>
        </div>

        <!-- Expand hint -->
        <div class="mt-3 text-center">
          <UIcon
            :name="expandedIds.has(prediction.id) ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            class="size-4 text-muted"
          />
        </div>
      </UPageCard>
    </div>
  </UPageSection>
</template>

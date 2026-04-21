<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { VotePredictionPublicResponse, VotePrediction, VoteValue, ConfidenceLevel } from '../../../shared/types/votePrediction'

const props = defineProps<{
  projectSlug: string
}>()

const { data, status, error, refresh } = await useFetch<VotePredictionPublicResponse>(
  `/api/backend/hub/projects/slug/${props.projectSlug}/vote-predictions`
)

const predictions = computed(() => data.value?.predictions || [])
const disclaimer = computed(() => data.value?.disclaimer || null)
const hasPredictions = computed(() => predictions.value.length > 0)

const voteConfig: Record<VoteValue, { label: string; color: 'success' | 'error' | 'warning' | 'neutral'; icon: string }> = {
  yes: { label: 'A favor', color: 'success', icon: 'lucide:thumbs-up' },
  no: { label: 'En contra', color: 'error', icon: 'lucide:thumbs-down' },
  abstain: { label: 'Abstención', color: 'neutral', icon: 'lucide:minus-circle' },
  divided: { label: 'Dividido', color: 'warning', icon: 'lucide:split' }
}

const confidenceConfig: Record<ConfidenceLevel, { label: string; color: 'success' | 'warning' | 'error' }> = {
  high: { label: 'Alta', color: 'success' },
  medium: { label: 'Media', color: 'warning' },
  low: { label: 'Baja', color: 'error' }
}

const statusConfig: Record<VotePrediction['status'], { label: string; color: 'primary' | 'neutral' | 'error' }> = {
  generated: { label: 'Generada', color: 'primary' },
  pending: { label: 'Pendiente', color: 'neutral' },
  failed: { label: 'Fallida', color: 'error' }
}

const defaultStatusMeta: { label: string; color: 'primary' | 'neutral' | 'error' } = {
  label: 'Sin estado',
  color: 'neutral'
}

const expanded = ref<Record<string, boolean>>({})

const columns: TableColumn<VotePrediction>[] = [
  { id: 'expand', header: '' },
  { id: 'party', header: 'Partido' },
  { id: 'vote', header: 'Predicción' },
  { id: 'confidence', header: 'Confianza' },
  { id: 'status', header: 'Estado' }
]

const voteBreakdown = computed(() => {
  const counts: Record<VoteValue, number> = { yes: 0, no: 0, abstain: 0, divided: 0 }

  for (const prediction of predictions.value) {
    const vote = prediction.contextualVote || prediction.theoreticalVote

    if (vote && vote in counts) {
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

function getVoteMeta(vote: VoteValue | null | undefined) {
  if (!vote) return null
  return voteConfig[vote] || null
}

function getConfidenceMeta(confidence: ConfidenceLevel | null | undefined) {
  if (!confidence) return null
  return confidenceConfig[confidence] || null
}

function getStatusMeta(status: VotePrediction['status'] | null | undefined) {
  if (!status) return defaultStatusMeta
  return statusConfig[status] || defaultStatusMeta
}

function getRowId(row: VotePrediction) {
  return String(row.id)
}

function getPartyName(prediction: VotePrediction) {
  return prediction.politicalParty?.shortName || prediction.politicalParty?.name || 'Partido'
}
</script>

<template>
  <UPageSection
    title="Predicción de votaciones por partido"
    description="Estimaciones generadas por inteligencia artificial sobre cómo votarían los partidos políticos sobre este proyecto."
  >
    <template #headline>
      <div class="text-5xl leading-none text-center">
        🗳️
      </div>
    </template>

    <UProgress v-if="status === 'pending' || status === 'idle'" indeterminate class="my-4" />

    <UAlert
      v-else-if="status === 'error'"
      color="error"
      variant="subtle"
      icon="lucide:alert-circle"
      title="No pudimos cargar las predicciones"
      :description="error?.message || 'Intentá nuevamente en unos minutos.'"
      :actions="[
        {
          icon: 'lucide:refresh-cw',
          label: 'Refrescar',
          color: 'neutral',
          variant: 'outline',
          onClick: () => refresh()
        }
      ]"
    />

    <UEmpty
      v-else-if="!hasPredictions"
      icon="lucide:vote"
      title="Todavía no hay predicciones disponibles"
      description="Aún no se generaron estimaciones de voto por partido para este proyecto."
      class="mx-auto"
    />

    <template v-else>
      <UAlert
        icon="lucide:shield-alert"
        color="warning"
        variant="subtle"
        :description="disclaimer || 'Las predicciones son generadas por IA con carácter orientativo. No constituyen garantía de resultado de ninguna votación.'"
        class="mb-6"
      />

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

      <UTable
        v-model:expanded="expanded"
        :data="predictions"
        :columns="columns"
        :get-row-id="getRowId"
        class="w-full border rounded-lg border-default"
        
      >
        <template #expand-cell="{ row }">
          <UButton
            color="neutral"
            variant="ghost"
            :icon="row.getIsExpanded() ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            :aria-label="row.getIsExpanded() ? 'Ocultar detalle' : 'Ver detalle'"
            @click="row.toggleExpanded()"
          />
        </template>

        <template #party-cell="{ row }">
          <div class="flex items-center gap-2 min-w-0">
            <UAvatar
              :alt="row.original.politicalParty?.name || 'Partido'"
              :src="row.original.politicalParty?.logoUrl || undefined"
              size="sm"
            />
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">{{ getPartyName(row.original) }}</p>
              <p v-if="row.original.politicalParty?.name && row.original.politicalParty?.shortName" class="text-xs text-muted truncate">
                {{ row.original.politicalParty.name }}
              </p>
            </div>
          </div>
        </template>

        <template #vote-cell="{ row }">
          <UBadge
            v-if="getVoteMeta(getDisplayVote(row.original))"
            :color="getVoteMeta(getDisplayVote(row.original))!.color"
            variant="subtle"
          >
            <span class="flex items-center gap-1.5">
              <UIcon :name="getVoteMeta(getDisplayVote(row.original))!.icon" class="size-3.5" />
              {{ getVoteMeta(getDisplayVote(row.original))!.label }}
            </span>
          </UBadge>
          <span v-else class="text-sm text-muted">Sin dato</span>
        </template>

        <template #confidence-cell="{ row }">
          <UBadge
            v-if="getConfidenceMeta(getDisplayConfidence(row.original))"
            :color="getConfidenceMeta(getDisplayConfidence(row.original))!.color"
            variant="subtle"
          >
            {{ getConfidenceMeta(getDisplayConfidence(row.original))!.label }}
          </UBadge>
          <span v-else class="text-sm text-muted">Sin dato</span>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="getStatusMeta(row.original.status).color"
            variant="subtle"
          >
            {{ getStatusMeta(row.original.status).label }}
          </UBadge>
        </template>

        <template #expanded="{ row }">
          <div class="p-4 border-y border-default space-y-4 whitespace-normal wrap-break-word">
            <UAlert
              v-if="row.original.contextualDiffersFromTheoretical"
              icon="lucide:alert-triangle"
              color="warning"
              variant="subtle"
              :description="row.original.contextualReasonForDifference || 'La evidencia contextual sugiere una postura diferente a la predicción teórica.'"
            />

            <div class="prose prose-sm max-w-none px-4 rounded-lg bg-elevated border border-default">
              <MDC :value="getDisplayJustification(row.original) || 'Sin justificación disponible'" />
            </div>

            <div v-if="row.original.contextualSources && row.original.contextualSources.length > 0">
              <p class="text-xs text-muted font-medium mb-2">Fuentes consultadas:</p>
              <div class="space-y-1">
                <div v-for="(source, i) in row.original.contextualSources" :key="`context-${row.original.id}-${i}`" class="text-sm flex items-start gap-2 min-w-0">
                  <UIcon name="lucide:external-link" class="size-3 shrink-0 text-primary" />
                  <a
                    v-if="source.url"
                    :href="source.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary hover:underline break-all"
                  >
                    {{ source.title }}
                  </a>
                  <span v-else class="text-muted wrap-break-word">{{ source.title }}</span>
                </div>
              </div>
            </div>

            <div v-if="row.original.theoreticalSources && row.original.theoreticalSources.length > 0 && !row.original.contextualVote">
              <p class="text-xs text-muted font-medium mb-2">Puntos del perfil relevantes:</p>
              <ul class="text-sm space-y-1 list-disc list-inside text-muted">
                <li v-for="(source, i) in row.original.theoreticalSources" :key="`theoretical-${row.original.id}-${i}`">{{ source.title }}</li>
              </ul>
            </div>

            <div v-if="row.original.contextualVote && row.original.theoreticalVote" class="flex gap-3 flex-wrap">
              <UBadge variant="outline" color="neutral">
                <span class="flex items-center gap-1">
                  <UIcon name="lucide:book-open" class="size-3" />
                  Teórico:
                  <UIcon :name="voteConfig[row.original.theoreticalVote]?.icon" class="size-3" />
                  {{ voteConfig[row.original.theoreticalVote]?.label }}
                </span>
              </UBadge>
              <UBadge variant="outline" color="neutral">
                <span class="flex items-center gap-1">
                  <UIcon name="lucide:globe" class="size-3" />
                  Contextual:
                  <UIcon :name="voteConfig[row.original.contextualVote]?.icon" class="size-3" />
                  {{ voteConfig[row.original.contextualVote]?.label }}
                </span>
              </UBadge>
            </div>
          </div>
        </template>
      </UTable>
    </template>
  </UPageSection>
</template>

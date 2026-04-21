<script setup lang="ts">
import type { VotePrediction, VotePredictionListResponse, VoteResult } from '~/shared/types/votePrediction'
import { CalendarDate } from '@internationalized/date'

definePageMeta({
  layout: 'panel-proyecto',
  middleware: 'auth'
})

const toast = useToast()
const route = useRoute()
const projectId = route.params.projectId

// --- Predictions data ---
const { data, pending, refresh } = await useAuthFetch<VotePredictionListResponse>(
  `/api/backend/projects/${projectId}/manage/vote-predictions`
)

const predictions = computed(() => data.value?.predictions || [])
const hasPredictions = computed(() => predictions.value.length > 0)
const hasGenerated = computed(() => predictions.value.some(p => p.status === 'generated'))

// --- Generation state ---
const isGenerating = ref(false)
const isRegenerating = ref(false)
const generatingContextualId = ref<number | null>(null)

// --- Contextual generation form ---
const contextualDateFrom = ref<CalendarDate | undefined>()
const contextualDateTo = ref<CalendarDate | undefined>()

const formatCalendarDate = (d: CalendarDate | undefined): string | null => {
  if (!d) return null
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

// --- Actions ---
async function generateTheoretical() {
  isGenerating.value = true
  try {
    await $authFetch(`/api/backend/projects/${projectId}/manage/vote-predictions/generate`, {
      method: 'POST',
    })
    toast.add({ color: 'success', title: 'Predicciones teóricas generadas', icon: 'lucide:check-circle' })
    await refresh()
  } catch (error: any) {
    toast.add({
      color: 'error',
      title: 'Error al generar predicciones',
      description: error?.data?.message || error?.message || 'Ocurrió un error inesperado',
    })
  } finally {
    isGenerating.value = false
  }
}

async function generateContextual(prediction: VotePrediction) {
  generatingContextualId.value = prediction.id
  try {
    await $authFetch(
      `/api/backend/projects/${projectId}/manage/vote-predictions/${prediction.id}/generate-contextual`,
      {
        method: 'POST',
        body: {
          dateFrom: formatCalendarDate(contextualDateFrom.value),
          dateTo: formatCalendarDate(contextualDateTo.value),
        },
      }
    )
    toast.add({ color: 'success', title: 'Predicción contextual generada', icon: 'lucide:check-circle' })
    await refresh()
  } catch (error: any) {
    toast.add({
      color: 'error',
      title: 'Error al generar predicción contextual',
      description: error?.data?.message || error?.message || 'Ocurrió un error inesperado',
    })
  } finally {
    generatingContextualId.value = null
  }
}

async function regenerateAll() {
  isRegenerating.value = true
  try {
    await $authFetch(`/api/backend/projects/${projectId}/manage/vote-predictions/regenerate`, {
      method: 'POST',
    })
    toast.add({ color: 'success', title: 'Predicciones regeneradas', icon: 'lucide:check-circle' })
    await refresh()
  } catch (error: any) {
    toast.add({
      color: 'error',
      title: 'Error al regenerar',
      description: error?.data?.message || error?.message || 'Ocurrió un error inesperado',
    })
  } finally {
    isRegenerating.value = false
  }
}

// --- Display helpers ---
const voteConfig: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'neutral'; icon: string }> = {
  yes: { label: 'A favor', color: 'success', icon: 'lucide:thumbs-up' },
  no: { label: 'En contra', color: 'error', icon: 'lucide:thumbs-down' },
  abstain: { label: 'Abstención', color: 'neutral', icon: 'lucide:minus-circle' },
  divided: { label: 'Dividido', color: 'warning', icon: 'lucide:split' },
}

const confidenceConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
  high: { label: 'Alta', color: 'success' },
  medium: { label: 'Media', color: 'warning' },
  low: { label: 'Baja', color: 'error' },
}

const statusConfig: Record<string, { label: string; color: 'success' | 'error' | 'neutral' }> = {
  generated: { label: 'Generado', color: 'success' },
  failed: { label: 'Error', color: 'error' },
  pending: { label: 'Pendiente', color: 'neutral' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-AR', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

// --- Expandable state ---
const expandedIds = ref<Set<number>>(new Set())
function toggleExpanded(id: number) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

// --- Vote results ---
const voteResult = ref<VoteResult | null>(null)

const refreshResult = async () => {
  try {
    const response = await $authFetch<{ voteResult: VoteResult | null }>(
      `/api/backend/projects/${projectId}/manage/vote-result`
    )
    voteResult.value = response?.voteResult || null
  } catch (error: any) {
    // A missing vote result is expected before uploading an official voting record.
    if (error?.statusCode === 404 || error?.response?.status === 404) {
      voteResult.value = null
      return
    }

    toast.add({
      color: 'error',
      title: 'Error al cargar resultado de votación',
      description: error?.data?.message || error?.message || 'Ocurrió un error inesperado',
    })
  }
}

await refreshResult()

const actaFileInput = ref<HTMLInputElement>()
const actaSourceUrl = ref('')
const isUploadingActa = ref(false)

async function uploadActa() {
  const file = actaFileInput.value?.files?.[0]
  if (!file) {
    toast.add({ color: 'error', title: 'Seleccioná un archivo de acta' })
    return
  }

  isUploadingActa.value = true
  try {
    const formData = new FormData()
    formData.append('actaFile', file)
    if (actaSourceUrl.value.trim()) {
      formData.append('sourceUrl', actaSourceUrl.value.trim())
    }

    await $authFetch(`/api/backend/projects/${projectId}/manage/vote-result/upload-acta`, {
      method: 'POST',
      body: formData,
    })
    toast.add({ color: 'success', title: 'Acta procesada exitosamente', icon: 'lucide:check-circle' })
    if (actaFileInput.value) actaFileInput.value.value = ''
    actaSourceUrl.value = ''
    await refreshResult()
  } catch (error: any) {
    toast.add({
      color: 'error',
      title: 'Error al procesar acta',
      description: error?.data?.message || error?.message || 'Ocurrió un error inesperado',
    })
  } finally {
    isUploadingActa.value = false
  }
}

const voteResultLabelMap: Record<string, string> = {
  yes: 'A favor',
  no: 'En contra',
  abstain: 'Abstención',
  divided: 'Dividido',
}
</script>

<template>
    <UPageHeader
      title="Predicción de Votaciones"
      headline="Análisis IA"
      description="Generá predicciones de cómo votarían los partidos políticos sobre este proyecto de ley, basándote en sus perfiles ideológicos y el contexto político actual."
      icon="lucide:vote"
    />

    <UPageBody>
      <!-- Disclaimer -->
      <UAlert
        icon="lucide:shield-alert"
        color="warning"
        variant="subtle"
        title="Predicciones con Inteligencia Artificial"
        description="Las predicciones son generadas por IA y tienen carácter orientativo. No constituyen garantía de resultado de ninguna votación. El sistema analiza perfiles ideológicos y fuentes públicas para estimar posturas."
        class="mb-6"
      />

      <!-- Empty state -->
      <UPageCard
        v-if="!hasPredictions && !pending && !isGenerating"
        variant="subtle"
        class="text-center py-10 mb-6"
      >
        <div class="space-y-4">
          <UIcon name="lucide:vote" class="size-12 text-primary mx-auto" />
          <div>
            <h3 class="text-lg font-semibold mb-1">No hay predicciones generadas</h3>
            <p class="text-sm text-muted max-w-md mx-auto">
              Generá predicciones teóricas basadas en los perfiles ideológicos de los partidos políticos activos.
              Los partidos deben tener su perfil de IA generado previamente.
            </p>
          </div>
          <UButton
            icon="lucide:sparkles"
            label="Generar predicciones teóricas"
            size="lg"
            :loading="isGenerating"
            @click="generateTheoretical"
          />
        </div>
      </UPageCard>

      <!-- Loading State -->
      <div v-if="isGenerating || isRegenerating" class="mb-8">
        <UPageCard variant="subtle" class="text-center py-10">
          <div class="space-y-6">
            <ThinkingMessages />
            <UProgress animation="swing" class="max-w-md mx-auto" />
            <p class="text-sm text-muted">Analizando perfiles de partidos y proyecto de ley...</p>
          </div>
        </UPageCard>
      </div>

      <!-- Actions bar -->
      <div v-if="hasPredictions && !isGenerating && !isRegenerating" class="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="lucide:info" class="size-4" />
          <span>{{ predictions.length }} partidos analizados</span>
        </div>
        <div class="flex items-center gap-3">
          <UButton
            icon="lucide:refresh-cw"
            label="Regenerar todas"
            color="neutral"
            variant="outline"
            :loading="isRegenerating"
            @click="regenerateAll"
          />
        </div>
      </div>

      <!-- Contextual date filter -->
      <UPageCard
        v-if="hasPredictions && !isGenerating && !isRegenerating"
        title="Filtro temporal para predicción contextual"
        description="Limitá la búsqueda web a un rango de fechas específico (opcional)."
        icon="lucide:calendar"
        variant="soft"
        class="mb-6"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Desde (opcional)">
            <UInputDate
              v-model="contextualDateFrom"
              icon="lucide:calendar"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Hasta (opcional)">
            <UInputDate
              v-model="contextualDateTo"
              icon="lucide:calendar"
              class="w-full"
            />
          </UFormField>
        </div>
      </UPageCard>

      <!-- Predictions Grid -->
      <div v-if="hasPredictions && !isGenerating && !isRegenerating" class="space-y-4">
        <UPageCard
          v-for="prediction in predictions"
          :key="prediction.id"
          variant="outline"
          :class="[
            'transition-all',
            prediction.status === 'failed' && 'border-error/30 opacity-75',
          ]"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <UAvatar
                :alt="prediction.politicalParty?.name || 'Partido'"
                :src="prediction.politicalParty?.logoUrl || undefined"
                size="lg"
              />
              <div>
                <h3 class="font-semibold text-lg">{{ prediction.politicalParty?.name || 'Partido desconocido' }}</h3>
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <UBadge
                    v-if="prediction.politicalParty?.shortName"
                    variant="subtle"
                    color="neutral"
                    size="xs"
                  >
                    {{ prediction.politicalParty.shortName }}
                  </UBadge>
                  <UBadge
                    :color="statusConfig[prediction.status]?.color || 'neutral'"
                    variant="subtle"
                    size="xs"
                  >
                    {{ statusConfig[prediction.status]?.label || prediction.status }}
                  </UBadge>
                  <span v-if="prediction.generatedAt" class="text-xs text-muted">
                    {{ formatDate(prediction.generatedAt) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Vote badges -->
            <div class="flex items-center gap-2 flex-wrap shrink-0">
              <div v-if="prediction.theoreticalVote" class="text-center">
                <p class="text-[10px] text-muted uppercase tracking-wider mb-1">Teórico</p>
                <UBadge
                  :color="voteConfig[prediction.theoreticalVote]?.color || 'neutral'"
                  variant="subtle"
                  size="sm"
                >
                  <span class="flex items-center gap-1.5">
                    <UIcon :name="voteConfig[prediction.theoreticalVote]?.icon" class="size-3.5" />
                    {{ voteConfig[prediction.theoreticalVote]?.label }}
                  </span>
                </UBadge>
              </div>
              <div v-if="prediction.contextualVote" class="text-center">
                <p class="text-[10px] text-muted uppercase tracking-wider mb-1">Contextual</p>
                <UBadge
                  :color="voteConfig[prediction.contextualVote]?.color || 'neutral'"
                  variant="subtle"
                  size="sm"
                >
                  <span class="flex items-center gap-1.5">
                    <UIcon :name="voteConfig[prediction.contextualVote]?.icon" class="size-3.5" />
                    {{ voteConfig[prediction.contextualVote]?.label }}
                  </span>
                </UBadge>
              </div>
            </div>
          </div>

          <!-- Expandable content -->
          <div v-if="prediction.status === 'generated'" class="mt-4">
            <UButton
              :label="expandedIds.has(prediction.id) ? 'Ocultar detalles' : 'Ver detalles'"
              :icon="expandedIds.has(prediction.id) ? 'lucide:chevron-up' : 'lucide:chevron-down'"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="toggleExpanded(prediction.id)"
            />

            <div v-if="expandedIds.has(prediction.id)" class="mt-4 space-y-6">
              <!-- Theoretical prediction -->
              <div v-if="prediction.theoreticalVote" class="space-y-3">
                <div class="flex items-center gap-2">
                  <UIcon name="lucide:book-open" class="size-4 text-primary" />
                  <h4 class="font-semibold text-sm">Predicción teórica</h4>
                  <UBadge
                    v-if="prediction.theoreticalConfidence"
                    :color="confidenceConfig[prediction.theoreticalConfidence]?.color || 'neutral'"
                    variant="subtle"
                    size="xs"
                  >
                    Confianza: {{ confidenceConfig[prediction.theoreticalConfidence]?.label }}
                  </UBadge>
                </div>
                <div class="prose prose-sm max-w-none p-4 rounded-lg bg-elevated border border-default">
                  <MDC :value="prediction.theoreticalJustification || 'Sin justificación'" />
                </div>
                <div v-if="prediction.theoreticalSources && prediction.theoreticalSources.length > 0">
                  <p class="text-xs text-muted mb-1">Puntos del perfil relevantes:</p>
                  <ul class="text-sm space-y-1 list-disc list-inside text-muted">
                    <li v-for="(source, i) in prediction.theoreticalSources" :key="i">{{ source.title }}</li>
                  </ul>
                </div>
              </div>

              <USeparator v-if="prediction.contextualVote" />

              <!-- Contextual prediction -->
              <div v-if="prediction.contextualVote" class="space-y-3">
                <div class="flex items-center gap-2">
                  <UIcon name="lucide:globe" class="size-4 text-info" />
                  <h4 class="font-semibold text-sm">Predicción contextual</h4>
                  <UBadge
                    v-if="prediction.contextualConfidence"
                    :color="confidenceConfig[prediction.contextualConfidence]?.color || 'neutral'"
                    variant="subtle"
                    size="xs"
                  >
                    Confianza: {{ confidenceConfig[prediction.contextualConfidence]?.label }}
                  </UBadge>
                </div>

                <UAlert
                  v-if="prediction.contextualDiffersFromTheoretical"
                  icon="lucide:alert-triangle"
                  color="warning"
                  variant="subtle"
                  title="Difiere de la predicción teórica"
                  :description="prediction.contextualReasonForDifference || 'La evidencia contextual sugiere una postura diferente a la predicción teórica.'"
                  class="mb-2"
                />

                <div class="prose prose-sm max-w-none p-4 rounded-lg bg-elevated border border-default">
                  <MDC :value="prediction.contextualJustification || 'Sin justificación'" />
                </div>

                <div v-if="prediction.contextualSources && prediction.contextualSources.length > 0">
                  <p class="text-xs text-muted mb-1">Fuentes:</p>
                  <div class="space-y-1">
                    <div v-for="(source, i) in prediction.contextualSources" :key="i" class="text-sm flex items-center gap-2">
                      <UIcon name="lucide:external-link" class="size-3 shrink-0" />
                      <a
                        v-if="source.url"
                        :href="source.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-primary hover:underline truncate"
                      >
                        {{ source.title }}
                      </a>
                      <span v-else class="text-muted">{{ source.title }}</span>
                      <span v-if="source.date" class="text-xs text-muted shrink-0">({{ source.date }})</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Generate contextual button -->
              <div v-if="prediction.theoreticalVote && !prediction.contextualVote" class="pt-2">
                <UButton
                  icon="lucide:globe"
                  label="Generar predicción contextual"
                  color="neutral"
                  variant="outline"
                  :loading="generatingContextualId === prediction.id"
                  @click="generateContextual(prediction)"
                />
              </div>
              <div v-else-if="prediction.contextualVote" class="pt-2">
                <UButton
                  icon="lucide:refresh-cw"
                  label="Regenerar contextual"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :loading="generatingContextualId === prediction.id"
                  @click="generateContextual(prediction)"
                />
              </div>
            </div>
          </div>

          <!-- Failed state -->
          <div v-if="prediction.status === 'failed'" class="mt-3">
            <UAlert
              icon="lucide:alert-circle"
              color="error"
              variant="subtle"
              title="Error en la generación"
              description="No se pudo generar la predicción para este partido. Intentá regenerar."
            />
          </div>
        </UPageCard>
      </div>

      <!-- Loading skeleton -->
      <div v-if="pending" class="space-y-4">
        <USkeleton class="h-40 w-full rounded-lg" />
        <USkeleton class="h-40 w-full rounded-lg" />
        <USkeleton class="h-40 w-full rounded-lg" />
      </div>

      <!-- Vote Results Section -->
      <USeparator class="my-8" />

      <UPageHeader
        title="Resultado de Votación"
        headline="Datos reales"
        description="Subí el acta de votación oficial para que la IA extraiga los resultados reales y los compare con las predicciones."
        icon="lucide:landmark"
        class="mb-6"
      />

      <UPageCard v-if="voteResult" variant="outline">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">Resultado cargado</h3>
            <UBadge color="success" variant="subtle" icon="lucide:check-circle">Procesado</UBadge>
          </div>

          <div class="flex items-center gap-8 flex-wrap">
            <div class="text-center">
              <div class="text-2xl font-bold text-success">{{ voteResult.totalYes }}</div>
              <div class="text-sm text-muted">A favor</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-error">{{ voteResult.totalNo }}</div>
              <div class="text-sm text-muted">En contra</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-warning">{{ voteResult.totalAbstain }}</div>
              <div class="text-sm text-muted">Abstenciones</div>
            </div>
          </div>

          <div v-if="voteResult.voteDate" class="text-sm text-muted">
            Fecha de votación: {{ new Date(voteResult.voteDate).toLocaleDateString('es-AR') }}
          </div>

          <div v-if="voteResult.sourceUrl" class="text-sm">
            <a :href="voteResult.sourceUrl" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline flex items-center gap-1 w-fit">
              <UIcon name="lucide:external-link" class="size-3" />
              Ver acta oficial
            </a>
          </div>

          <div v-if="voteResult.resultsByParty?.length" class="space-y-2 mt-4">
            <h4 class="text-sm font-medium">Por partido:</h4>
            <div
              v-for="partyResult in voteResult.resultsByParty"
              :key="partyResult.id"
              class="flex items-center justify-between p-3 rounded-lg border border-default"
            >
              <div class="flex items-center gap-2">
                <UAvatar
                  v-if="partyResult.politicalParty?.logoUrl"
                  :src="partyResult.politicalParty.logoUrl"
                  :alt="partyResult.politicalParty?.name"
                  size="xs"
                />
                <span class="text-sm font-medium">
                  {{ partyResult.politicalParty?.shortName || partyResult.politicalParty?.name || 'Partido' }}
                </span>
              </div>
              <div class="flex items-center gap-3 text-xs text-muted">
                <span class="text-success">{{ partyResult.votedYes }} sí</span>
                <span class="text-error">{{ partyResult.votedNo }} no</span>
                <span class="text-warning">{{ partyResult.votedAbstain }} abs.</span>
                <UBadge
                  :color="voteConfig[partyResult.majorityVote]?.color || 'neutral'"
                  variant="subtle"
                  size="xs"
                >
                  {{ voteResultLabelMap[partyResult.majorityVote] || partyResult.majorityVote }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </UPageCard>

      <UPageCard v-else variant="subtle" class="text-center py-8">
        <div class="space-y-4 max-w-md mx-auto">
          <UIcon name="lucide:landmark" class="size-10 text-muted mx-auto" />
          <div>
            <h3 class="text-lg font-semibold mb-1">Sin resultado de votación</h3>
            <p class="text-sm text-muted">
              Cuando el proyecto sea votado, subí el PDF del acta oficial para que la IA extraiga los totales y el desglose por partido.
            </p>
          </div>
          <div class="space-y-3 text-left">
            <UFormField label="Archivo del acta (PDF)">
              <input
                ref="actaFileInput"
                type="file"
                accept=".pdf"
                class="text-sm"
              />
            </UFormField>
            <UFormField label="URL de la fuente oficial (opcional)">
              <UInput
                v-model="actaSourceUrl"
                placeholder="https://..."
                icon="lucide:link"
                class="w-full"
              />
            </UFormField>
            <UButton
              label="Procesar Acta"
              icon="lucide:upload"
              :loading="isUploadingActa"
              @click="uploadActa"
            />
          </div>
        </div>
      </UPageCard>
    </UPageBody>
</template>

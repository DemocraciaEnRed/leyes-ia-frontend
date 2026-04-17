<script setup lang="ts">
import type { Legislator } from '~/shared/types/legislator'
import type { LegislatorQuoteResult, LegislatorQuoteSearchResponse, LegislatorQuoteSearchRecord } from '~/shared/types/legislatorQuotes'
import type { SelectMenuItem } from '@nuxt/ui'
import { CalendarDate } from '@internationalized/date'

definePageMeta({
  layout: 'workspace',
  middleware: 'auth'
})

const toast = useToast()
const route = useRoute()
const projectId = route.params.projectId

// --- Legislators data ---
const { data: legislatorsData } = await useFetch<{ legislators: Legislator[] }>('/api/backend/legislators')

const legislatorItems = computed<SelectMenuItem[]>(() => {
  if (!legislatorsData.value?.legislators) return []
  return legislatorsData.value.legislators.map(l => ({
    label: `${l.firstName} ${l.lastName}`,
    value: l.id,
    icon: l.chamber === 'deputies' ? 'lucide:landmark' : 'lucide:building-2',
    description: `${l.chamber === 'deputies' ? 'Diputado/a' : 'Senador/a'} · ${l.province?.name || 'Sin provincia'} · ${l.blockName || 'Sin bloque'}`
  }))
})

// --- Form state ---
const selectedLegislatorIds = ref<number[]>([])
const dateRangeStart = ref<CalendarDate | undefined>()
const dateRangeEnd = ref<CalendarDate | undefined>()
const forceRegenerate = ref(false)
const isSearching = ref(false)

// --- Results ---
const searchResults = ref<LegislatorQuoteResult[]>([])
const searchUsage = ref<LegislatorQuoteSearchResponse['usage']>(null)
const hasSearched = ref(false)

// --- Previous results ---
const { data: historyData, refresh: refreshHistory } = await useFetch<{ results: LegislatorQuoteSearchRecord[] }>(
  `/api/backend/projects/${projectId}/manage/legislator-quotes`
)

const canSearch = computed(() => {
  return selectedLegislatorIds.value.length >= 1 && selectedLegislatorIds.value.length <= 5
})

const formatCalendarDate = (d: CalendarDate | undefined): string | null => {
  if (!d) return null
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

const handleSearch = async () => {
  if (!canSearch.value) return

  isSearching.value = true
  hasSearched.value = false
  searchResults.value = []
  searchUsage.value = null

  try {
    const response = await $fetch<LegislatorQuoteSearchResponse>(
      `/api/backend/projects/${projectId}/manage/legislator-quotes`,
      {
        method: 'POST',
        body: {
          legislatorIds: selectedLegislatorIds.value,
          dateRangeStart: formatCalendarDate(dateRangeStart.value),
          dateRangeEnd: formatCalendarDate(dateRangeEnd.value),
          forceRegenerate: forceRegenerate.value
        }
      }
    )

    searchResults.value = response.results
    searchUsage.value = response.usage
    hasSearched.value = true

    toast.add({
      icon: 'lucide:check-circle',
      title: 'Búsqueda completada',
      description: `Se encontraron resultados para ${response.results.filter((r: LegislatorQuoteResult) => r.found).length} de ${response.results.length} legisladores.`,
      color: 'success'
    })

    await refreshHistory()
  }
  catch (err: any) {
    toast.add({
      icon: 'lucide:alert-triangle',
      title: 'Error en la búsqueda',
      description: err?.data?.message || err?.message || 'Ocurrió un error inesperado.',
      color: 'error'
    })
  }
  finally {
    isSearching.value = false
  }
}

// --- Helpers ---
const stanceConfig: Record<string, { label: string; color: 'success' | 'error' | 'neutral' | 'warning'; icon: string }> = {
  a_favor: { label: 'A favor', color: 'success', icon: 'lucide:thumbs-up' },
  en_contra: { label: 'En contra', color: 'error', icon: 'lucide:thumbs-down' },
  neutral: { label: 'Neutral', color: 'neutral', icon: 'lucide:minus-circle' },
  ambiguo: { label: 'Ambiguo', color: 'warning', icon: 'lucide:help-circle' }
}

const getStanceDisplay = (stance: string | null) => {
  if (!stance) return null
  return stanceConfig[stance] || null
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Fecha no disponible'
  try {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  catch {
    return dateStr
  }
}

// --- History deduplication ---
const uniqueHistory = computed(() => {
  if (!historyData.value?.results) return []
  const seen = new Map<number, LegislatorQuoteSearchRecord>()
  for (const record of historyData.value.results) {
    if (!seen.has(record.legislatorId)) {
      seen.set(record.legislatorId, record)
    }
  }
  return Array.from(seen.values())
})
</script>

<template>
  <NuxtLayout name="panel-proyecto">
    <UPageHeader
      title="Citas de Legisladores"
      headline="Análisis IA"
      description="Buscá declaraciones públicas y opiniones de legisladores sobre tu proyecto de ley, basándote en fuentes verificables."
      icon="lucide:quote"
    />

    <UPageBody>
      <!-- Disclaimer -->
      <UAlert
        icon="lucide:info"
        color="info"
        variant="subtle"
        title="Búsqueda con Inteligencia Artificial"
        description="Las citas y opiniones son buscadas por IA usando fuentes públicas de internet. Los resultados pueden contener imprecisiones. Se recomienda verificar las fuentes originales haciendo clic en los enlaces proporcionados."
        class="mb-6"
      />

      <!-- Search Form -->
      <UPageCard
        title="Buscar citas"
        description="Seleccioná entre 1 y 5 legisladores para buscar sus opiniones sobre este proyecto."
        icon="lucide:search"
        variant="subtle"
        class="mb-8"
      >
        <div class="space-y-5">
          <!-- Legislator Selector -->
          <UFormField label="Legisladores" required :help="`${selectedLegislatorIds.length}/5 seleccionados`">
            <USelectMenu
              v-model="selectedLegislatorIds"
              :items="legislatorItems"
              multiple
              value-key="value"
              placeholder="Seleccionar legisladores..."
              class="w-full"
              icon="lucide:users"
              :search-input="{ placeholder: 'Buscar por nombre...' }"
            />
          </UFormField>

          <!-- Date Range -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Desde (opcional)" help="Inicio del rango de fechas para la búsqueda">
              <UInputDate
                v-model="dateRangeStart"
                icon="lucide:calendar"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Hasta (opcional)" help="Fin del rango de fechas para la búsqueda">
              <UInputDate
                v-model="dateRangeEnd"
                icon="lucide:calendar"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Options -->
          <div class="flex items-center justify-between flex-wrap gap-4">
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <UCheckbox v-model="forceRegenerate" />
              <span class="text-muted">Forzar regeneración (ignorar caché)</span>
            </label>

            <UButton
              icon="lucide:sparkles"
              label="Buscar citas"
              :loading="isSearching"
              :disabled="!canSearch || isSearching"
              size="lg"
              @click="handleSearch"
            />
          </div>
        </div>
      </UPageCard>

      <!-- Loading State -->
      <div v-if="isSearching" class="space-y-4 mb-8">
        <UPageCard variant="subtle" class="text-center py-10">
          <div class="space-y-6">
            <ThinkingMessages />
            <UProgress animation="swing" class="max-w-md mx-auto" />
            <p class="text-sm text-muted">Buscando en fuentes públicas de internet...</p>
          </div>
        </UPageCard>
      </div>

      <!-- Results -->
      <div v-if="hasSearched && !isSearching" class="space-y-6 mb-8">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Resultados</h2>
          <div v-if="searchUsage" class="flex items-center gap-2 text-xs text-muted">
            <UBadge variant="subtle" color="neutral" size="xs">
              <span class="flex items-center gap-1">
                <UIcon name="lucide:cpu" class="size-3" />
                {{ searchUsage.model }}
              </span>
            </UBadge>
            <UBadge variant="subtle" color="neutral" size="xs">
              {{ searchUsage.totalTokens?.toLocaleString('es-AR') }} tokens
            </UBadge>
            <UBadge variant="subtle" color="neutral" size="xs">
              {{ (searchUsage.latencyMs / 1000).toFixed(1) }}s
            </UBadge>
          </div>
        </div>

        <div class="grid gap-6">
          <UPageCard
            v-for="result in searchResults"
            :key="result.legislatorId"
            variant="outline"
            :class="[
              'transition-all',
              result.found ? 'border-primary/30' : 'border-default opacity-75'
            ]"
          >
            <!-- Card Header -->
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <UIcon name="lucide:user" class="size-5 text-primary" />
                </div>
                <div>
                  <h3 class="font-semibold text-base">{{ result.legislatorName }}</h3>
                  <div class="flex items-center gap-2 mt-0.5">
                    <UBadge
                      v-if="result.cached"
                      variant="subtle"
                      color="neutral"
                      size="xs"
                    >
                      <span class="flex items-center gap-1">
                        <UIcon name="lucide:database" class="size-3" />
                        Caché
                      </span>
                    </UBadge>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <UBadge
                  v-if="getStanceDisplay(result.stance)"
                  :color="getStanceDisplay(result.stance)!.color"
                  variant="subtle"
                  size="sm"
                >
                  <span class="flex items-center gap-1.5">
                    <UIcon :name="getStanceDisplay(result.stance)!.icon" class="size-3.5" />
                    {{ getStanceDisplay(result.stance)!.label }}
                  </span>
                </UBadge>
                <UBadge
                  v-if="!result.found"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                >
                  Sin resultados
                </UBadge>
              </div>
            </div>

            <!-- Summary -->
            <div v-if="result.summary" class="mb-4">
              <MDC :value="result.summary" class="text-sm text-muted prose prose-sm max-w-none" />
            </div>

            <!-- Quotes -->
            <div v-if="result.found && result.quotes.length > 0" class="space-y-3">
              <USeparator label="Citas encontradas" />

              <div
                v-for="(quote, qi) in result.quotes"
                :key="qi"
                class="relative pl-4 border-l-2 border-primary/30 py-2 space-y-1.5"
              >
                <p class="text-sm leading-relaxed">{{ quote.content }}</p>

                <p v-if="quote.context" class="text-xs text-muted italic">{{ quote.context }}</p>

                <div class="flex items-center gap-3 flex-wrap text-xs text-muted">
                  <span v-if="quote.date" class="flex items-center gap-1">
                    <UIcon name="lucide:calendar" class="size-3" />
                    {{ formatDate(quote.date) }}
                  </span>

                  <template v-if="quote.sourceUrl">
                    <a
                      :href="quote.sourceUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-1 text-primary hover:underline"
                    >
                      <UIcon name="lucide:external-link" class="size-3" />
                      {{ quote.source }}
                    </a>
                  </template>
                  <template v-else>
                    <span class="flex items-center gap-1">
                      <UIcon name="lucide:file-text" class="size-3" />
                      {{ quote.source }}
                    </span>
                    <UBadge variant="subtle" color="warning" size="xs">
                      <span class="flex items-center gap-1">
                        <UIcon name="lucide:alert-triangle" class="size-2.5" />
                        Fuente no verificada
                      </span>
                    </UBadge>
                  </template>
                </div>
              </div>
            </div>

            <!-- Not found state -->
            <div v-if="!result.found" class="flex items-center gap-3 py-3 text-muted">
              <UIcon name="lucide:search-x" class="size-5" />
              <p class="text-sm">No se encontraron declaraciones públicas para este legislador sobre el proyecto.</p>
            </div>
          </UPageCard>
        </div>
      </div>

      <!-- Previous Results -->
      <div v-if="uniqueHistory.length > 0 && !isSearching" class="space-y-4">
        <USeparator icon="lucide:history" label="Búsquedas anteriores" />

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UPageCard
            v-for="record in uniqueHistory"
            :key="record.id"
            variant="soft"
            class="text-sm"
          >
            <div class="flex items-center gap-3 mb-2">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <UIcon name="lucide:user" class="size-4 text-primary" />
              </div>
              <div>
                <p class="font-medium">{{ record.legislator.firstName }} {{ record.legislator.lastName }}</p>
                <p class="text-xs text-muted">
                  {{ record.legislator.chamber === 'deputies' ? 'Diputado/a' : 'Senador/a' }}
                  <span v-if="record.legislator.province">· {{ record.legislator.province.name }}</span>
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <UBadge
                v-if="record.found"
                :color="getStanceDisplay(record.stance)?.color || 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ getStanceDisplay(record.stance)?.label || 'Encontrado' }}
              </UBadge>
              <UBadge v-else color="neutral" variant="subtle" size="xs">
                Sin resultados
              </UBadge>
              <span class="text-xs text-muted ml-auto">
                {{ formatDate(record.createdAt) }}
              </span>
            </div>
          </UPageCard>
        </div>
      </div>

      <!-- Empty state -->
      <UEmpty
        v-if="!hasSearched && !isSearching && uniqueHistory.length === 0"
        icon="lucide:quote"
        title="Sin búsquedas previas"
        description="Seleccioná legisladores y buscá sus opiniones sobre este proyecto de ley."
        class="my-12"
      />
    </UPageBody>
  </NuxtLayout>
</template>

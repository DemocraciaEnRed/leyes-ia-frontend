<script setup lang="ts">
import type { LegislatorQuoteSearchRecord } from '../../../shared/types/legislatorQuotes'

const props = defineProps<{
  projectSlug: string
}>()

const { data, status, error, refresh } = await useFetch<{ results: LegislatorQuoteSearchRecord[] }>(
  `/api/backend/hub/projects/slug/${props.projectSlug}/legislator-quotes`
)

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

const uniqueResults = computed(() => {
  if (!data.value?.results) return []

  const seen = new Map<number, LegislatorQuoteSearchRecord>()

  for (const record of data.value.results) {
    if (!seen.has(record.legislatorId)) {
      seen.set(record.legislatorId, record)
    }
  }

  return Array.from(seen.values()).filter(record => record.found)
})

const hasResults = computed(() => uniqueResults.value.length > 0)
const expandedQuoteIds = ref<Set<string | number>>(new Set())
const carouselRecords = computed(() => {
  return uniqueResults.value.map(record => ({
    ...record,
    class: 'basis-full md:basis-1/2'
  }))
})

function toggleQuotes(recordId: string | number) {
  if (expandedQuoteIds.value.has(recordId)) {
    expandedQuoteIds.value.delete(recordId)
    return
  }

  expandedQuoteIds.value.add(recordId)
}

function visibleQuotes(record: LegislatorQuoteSearchRecord) {
  const quotes = record.result?.quotes || []

  if (expandedQuoteIds.value.has(record.id)) {
    return quotes
  }

  return quotes.slice(0, 2)
}

function toQuoteRecord(item: unknown): LegislatorQuoteSearchRecord {
  return item as LegislatorQuoteSearchRecord
}
</script>

<template>
  <UPageSection
    title="Opiniones de legisladores"
    description="Declaraciones públicas y opiniones de legisladores sobre este proyecto, buscadas con inteligencia artificial en fuentes verificables."
  >
    <template #headline>
      <div class="text-5xl leading-none text-center">
        🗣️
      </div>
    </template>

    <UProgress v-if="status === 'pending' || status === 'idle'" indeterminate class="my-4" />

    <UAlert
      v-else-if="status === 'error'"
      color="error"
      variant="subtle"
      icon="lucide:alert-circle"
      title="No pudimos cargar las opiniones"
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
      v-else-if="!hasResults"
      icon="lucide:quote"
      title="Todavía no hay opiniones disponibles"
      description="No encontramos declaraciones públicas de legisladores sobre este proyecto por el momento."
      class="mx-auto"
    />

    <template v-else>
      <UAlert
        icon="lucide:info"
        color="info"
        variant="subtle"
        description="Las citas fueron buscadas por inteligencia artificial y pueden contener imprecisiones. Se recomienda verificar las fuentes originales."
        class="mb-6"
      />

      <UCarousel
        v-slot="{ item }"
        arrows
        dots
        :items="carouselRecords"
      >
        <div v-for="record in [toQuoteRecord(item)]" :key="record.id">
          <UPageCard
            variant="outline"
            class="h-full border-primary/20 m-1"
          >
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="record.legislator.photoUrl || undefined"
                  :alt="`${record.legislator.firstName} ${record.legislator.lastName}`"
                  class="size-10 shrink-0"
                />
                <div>
                  <h4 class="font-semibold">{{ record.legislator.firstName }} {{ record.legislator.lastName }}</h4>
                  <p class="text-xs text-muted">
                    {{ record.legislator.chamber === 'deputies' ? 'Diputado/a' : 'Senador/a' }}
                    <span v-if="record.legislator.province">· {{ record.legislator.province.name }}</span>
                    <span v-if="record.legislator.blockName">· {{ record.legislator.blockName }}</span>
                  </p>
                </div>
              </div>

              <UBadge
                v-if="getStanceDisplay(record.stance)"
                :color="getStanceDisplay(record.stance)!.color"
                variant="subtle"
                size="sm"
              >
                <span class="flex items-center gap-1">
                  <UIcon :name="getStanceDisplay(record.stance)!.icon" class="size-3.5" />
                  {{ getStanceDisplay(record.stance)!.label }}
                </span>
              </UBadge>
            </div>

            <MDC
              v-if="record.result?.summary"
              :value="record.result.summary"
              class="text-sm text-muted prose prose-sm max-w-none mb-3"
            />

            <div v-if="record.result?.quotes?.length" class="space-y-2">
              <div
                v-for="(quote, qi) in visibleQuotes(record)"
                :key="qi"
                class="pl-3 border-l-2 border-primary/25 py-1"
              >
                <p :class="['text-sm leading-relaxed', expandedQuoteIds.has(record.id) ? '' : 'line-clamp-3']">{{ quote.content }}</p>
                <div class="flex items-center gap-2 mt-1 text-xs text-muted">
                  <span v-if="quote.date">{{ formatDate(quote.date) }}</span>
                  <template v-if="quote.sourceUrl">
                    <a
                      :href="quote.sourceUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-primary hover:underline flex items-center gap-1"
                    >
                      <UIcon name="lucide:external-link" class="size-3" />
                      {{ quote.source }}
                    </a>
                  </template>
                  <span v-else class="flex items-center gap-1">
                    {{ quote.source }}
                    <UBadge v-if="!quote.sourceUrl" variant="subtle" color="warning" size="xs">
                      No verificada
                    </UBadge>
                  </span>
                </div>
              </div>

              <div v-if="record.result.quotes.length > 2" class="flex items-center justify-between gap-3 pt-1">
                <p class="text-xs text-muted">
                  <template v-if="expandedQuoteIds.has(record.id)">
                    Mostrando {{ record.result.quotes.length }} cita(s)
                  </template>
                  <template v-else>
                    y {{ record.result.quotes.length - 2 }} cita(s) más
                  </template>
                </p>

                <UButton
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  :label="expandedQuoteIds.has(record.id) ? 'Ver menos' : 'Ver todas'"
                  :trailing-icon="expandedQuoteIds.has(record.id) ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                  @click.stop="toggleQuotes(record.id)"
                />
              </div>
            </div>
          </UPageCard>
        </div>
      </UCarousel>
    </template>
  </UPageSection>
</template>

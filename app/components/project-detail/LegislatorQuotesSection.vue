<script setup lang="ts">
import type { LegislatorQuoteSearchRecord } from '~/shared/types/legislatorQuotes'

const props = defineProps<{
  projectSlug: string
}>()

const { data, status } = await useFetch<{ results: LegislatorQuoteSearchRecord[] }>(
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

// Deduplicate: keep only the most recent per legislator
const uniqueResults = computed(() => {
  if (!data.value?.results) return []
  const seen = new Map<number, LegislatorQuoteSearchRecord>()
  for (const record of data.value.results) {
    if (!seen.has(record.legislatorId)) {
      seen.set(record.legislatorId, record)
    }
  }
  return Array.from(seen.values()).filter(r => r.found)
})

const hasResults = computed(() => uniqueResults.value.length > 0)
</script>

<template>
  <UPageSection
    v-if="hasResults"
    title="Opiniones de legisladores"
    description="Declaraciones públicas y opiniones de legisladores sobre este proyecto, buscadas con inteligencia artificial en fuentes verificables."
  >
    <template #headline>
      <div class="text-5xl leading-none text-center">
        🗣️
      </div>
    </template>

    <UAlert
      icon="lucide:info"
      color="info"
      variant="subtle"
      description="Las citas fueron buscadas por inteligencia artificial y pueden contener imprecisiones. Se recomienda verificar las fuentes originales."
      class="mb-6"
    />

    <div class="grid gap-6 md:grid-cols-2">
      <UPageCard
        v-for="record in uniqueResults"
        :key="record.id"
        variant="outline"
        class="border-primary/20"
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <UIcon name="lucide:user" class="size-5 text-primary" />
            </div>
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

        <!-- Summary -->
        <MDC
          v-if="record.result?.summary"
          :value="record.result.summary"
          class="text-sm text-muted prose prose-sm max-w-none mb-3"
        />

        <!-- Top quotes preview -->
        <div v-if="record.result?.quotes?.length" class="space-y-2">
          <div
            v-for="(quote, qi) in record.result.quotes.slice(0, 2)"
            :key="qi"
            class="pl-3 border-l-2 border-primary/25 py-1"
          >
            <p class="text-sm leading-relaxed line-clamp-3">{{ quote.content }}</p>
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
          <p v-if="record.result.quotes.length > 2" class="text-xs text-muted text-center">
            y {{ record.result.quotes.length - 2 }} cita(s) más
          </p>
        </div>
      </UPageCard>
    </div>
  </UPageSection>
</template>

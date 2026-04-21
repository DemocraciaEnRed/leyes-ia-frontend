<script setup lang="ts">
import type { VoteResult, VoteResultResponse, VoteResultByParty } from '~/shared/types/votePrediction'

const props = defineProps<{
  projectSlug: string
}>()

const { data, status } = await useFetch<VoteResultResponse>(
  `/api/backend/hub/projects/slug/${props.projectSlug}/vote-result`
)

const voteResult = computed(() => data.value?.voteResult || null)
const hasResult = computed(() => !!voteResult.value)

const total = computed(() => {
  if (!voteResult.value) return 0
  return voteResult.value.totalYes + voteResult.value.totalNo + voteResult.value.totalAbstain
})

const percentYes = computed(() => total.value ? Math.round((voteResult.value!.totalYes / total.value) * 100) : 0)
const percentNo = computed(() => total.value ? Math.round((voteResult.value!.totalNo / total.value) * 100) : 0)
const percentAbstain = computed(() => total.value ? Math.round((voteResult.value!.totalAbstain / total.value) * 100) : 0)

const majorityVoteLabel: Record<string, string> = {
  yes: 'A favor',
  no: 'En contra',
  abstain: 'Abstención',
  divided: 'Dividido',
}

const majorityVoteColor: Record<string, string> = {
  yes: 'success',
  no: 'error',
  abstain: 'warning',
  divided: 'neutral',
}
</script>

<template>
  <UPageSection
    v-if="hasResult"
    title="Resultado de la votación"
    description="Resultado real de la votación en el recinto parlamentario."
  >
    <template #headline>
      <div class="text-5xl leading-none text-center">
        🏛️
      </div>
    </template>

    <!-- General totals -->
    <div class="flex items-center justify-center gap-8 mb-8 flex-wrap">
      <div class="text-center">
        <div class="text-3xl font-bold text-success">{{ voteResult!.totalYes }}</div>
        <div class="text-sm text-muted">A favor</div>
        <div class="text-xs text-muted">({{ percentYes }}%)</div>
      </div>
      <div class="text-center">
        <div class="text-3xl font-bold text-error">{{ voteResult!.totalNo }}</div>
        <div class="text-sm text-muted">En contra</div>
        <div class="text-xs text-muted">({{ percentNo }}%)</div>
      </div>
      <div class="text-center">
        <div class="text-3xl font-bold text-warning">{{ voteResult!.totalAbstain }}</div>
        <div class="text-sm text-muted">Abstenciones</div>
        <div class="text-xs text-muted">({{ percentAbstain }}%)</div>
      </div>
    </div>

    <!-- Vote bar -->
    <div class="w-full h-4 rounded-full overflow-hidden flex mb-6 bg-muted/20">
      <div
        class="bg-success transition-all"
        :style="{ width: `${percentYes}%` }"
      />
      <div
        class="bg-error transition-all"
        :style="{ width: `${percentNo}%` }"
      />
      <div
        class="bg-warning transition-all"
        :style="{ width: `${percentAbstain}%` }"
      />
    </div>

    <!-- Date and source -->
    <div class="flex items-center justify-center gap-4 mb-6 text-sm text-muted">
      <span v-if="voteResult!.voteDate">
        Fecha: {{ new Date(voteResult!.voteDate).toLocaleDateString('es-AR') }}
      </span>
      <a
        v-if="voteResult!.sourceUrl"
        :href="voteResult!.sourceUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary hover:underline flex items-center gap-1"
      >
        <UIcon name="lucide:external-link" class="size-3" />
        Ver acta oficial
      </a>
    </div>

    <!-- By-party breakdown -->
    <div v-if="voteResult!.resultsByParty?.length" class="space-y-3">
      <h3 class="text-lg font-semibold text-center mb-4">Desglose por partido</h3>
      <div class="grid gap-3 md:grid-cols-2">
        <UPageCard
          v-for="partyResult in voteResult!.resultsByParty"
          :key="partyResult.id"
          variant="outline"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UAvatar
                v-if="partyResult.politicalParty?.logoUrl"
                :src="partyResult.politicalParty.logoUrl"
                :alt="partyResult.politicalParty?.name"
                size="sm"
              />
              <UIcon v-else name="i-lucide-building-2" class="text-lg text-muted" />
              <span class="font-medium text-sm">
                {{ partyResult.politicalParty?.shortName || partyResult.politicalParty?.name || 'Partido' }}
              </span>
            </div>
            <UBadge
              :color="(majorityVoteColor[partyResult.majorityVote] as any) || 'neutral'"
              variant="subtle"
              size="sm"
            >
              {{ majorityVoteLabel[partyResult.majorityVote] || partyResult.majorityVote }}
            </UBadge>
          </div>
          <div class="flex items-center gap-4 mt-2 text-xs text-muted">
            <span class="text-success">{{ partyResult.votedYes }} a favor</span>
            <span class="text-error">{{ partyResult.votedNo }} en contra</span>
            <span class="text-warning">{{ partyResult.votedAbstain }} abs.</span>
          </div>
        </UPageCard>
      </div>
    </div>
  </UPageSection>
</template>

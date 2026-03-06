<script setup lang="ts">
import type {
  ChoiceQuestionResult,
  OpenEndedQuestionResult,
  RatingQuestionResult,
  SurveyQuestionResult
} from './types'
import type { ChartColorMode } from '~/utils/chartColors'
import { getQuestionTypeLabel } from '~/utils/getQuestionTypeLabel'
import { normalizeSurveyQuestionType } from '~/utils/normalizeSurveyQuestionType'
import { buildIndexedChartCategories, getChartColor } from '~/utils/chartColors'

interface Props {
  question: SurveyQuestionResult
  questionPrompt?: string | null
  questionHelpText?: string | null
  colorMode?: ChartColorMode
  singleColor?: string
}

const OPEN_ENDED_PAGE_SIZE = 8

const props = withDefaults(defineProps<Props>(), {
  questionPrompt: null,
  questionHelpText: null,
  colorMode: 'indexed',
  singleColor: 'var(--ui-primary)'
})

const displayQuestionText = computed(() => {
  if (props.questionPrompt?.trim())
    return props.questionPrompt.trim()

  return props.question.title
})

const displayQuestionHelpText = computed(() => {
  if (!props.questionHelpText)
    return ''

  return props.questionHelpText.trim()
})

const currentOpenEndedPage = ref(1)

const isChoiceQuestion = (question: SurveyQuestionResult): question is ChoiceQuestionResult => {
  return question.type === 'single-choice' || question.type === 'multiple-choice'
}

const isRatingQuestion = (question: SurveyQuestionResult): question is RatingQuestionResult => {
  return question.type === 'rating'
}

const isOpenEndedQuestion = (question: SurveyQuestionResult): question is OpenEndedQuestionResult => {
  return question.type === 'open-ended'
}

const questionTypeText = computed(() => {
  const normalizedType = normalizeSurveyQuestionType(props.question.type)
  return getQuestionTypeLabel(normalizedType)
})

const getChoiceDonutCategories = (question: ChoiceQuestionResult) => {
  return buildIndexedChartCategories(
    question.distribution,
    option => option.option,
    {
      keyPrefix: 'option_',
      colorMode: props.colorMode,
      singleColor: props.singleColor
    }
  )
}

const getChoiceDonutData = (question: ChoiceQuestionResult) => {
  return question.distribution.map(option => option.count)
}

const ratingChartCategories = computed(() => ({
  count: {
    name: 'Respuestas',
    color: getChartColor(0, props.colorMode, props.singleColor)
  }
}))

const getRatingChartData = (question: RatingQuestionResult) => {
  return question.distribution.map(item => ({
    score: String(item.value),
    count: item.count
  }))
}

const getOpenEndedTotalPages = (question: OpenEndedQuestionResult) => {
  return Math.max(1, Math.ceil(question.responses.length / OPEN_ENDED_PAGE_SIZE))
}

const setOpenEndedPage = (question: OpenEndedQuestionResult, targetPage: number) => {
  const totalPages = getOpenEndedTotalPages(question)
  currentOpenEndedPage.value = Math.min(Math.max(targetPage, 1), totalPages)
}

const getOpenEndedVisibleResponses = (question: OpenEndedQuestionResult) => {
  const start = (currentOpenEndedPage.value - 1) * OPEN_ENDED_PAGE_SIZE
  return question.responses.slice(start, start + OPEN_ENDED_PAGE_SIZE)
}

watch(
  () => props.question.questionIndex,
  () => {
    currentOpenEndedPage.value = 1
  }
)
</script>

<template>
  <UPageCard
    variant="subtle"
    :ui="{ container: 'space-y-4' }"
  >
    <div class="space-y-2">
      <div class="flex flex-row sm:flex-row justify-between items-center gap-2 border-b border-default pb-3 ">
          
          <h2 class="text-lg font-semibold md:text-xl">
              Pregunta {{ question.questionIndex + 1 }}
            </h2>
            <div class="flex items-center gap-2">
                
                <UBadge
        color="neutral"
            variant="subtle"
            >
            {{ questionTypeText }}
            </UBadge>

            <UBadge
            v-if="question.required"
            color="warning"
            variant="subtle"
            >
          Obligatoria
        </UBadge>
            </div>
      </div>

      <div class="space-y-1 border-b border-default pb-3">
        <p class="text-xs font-medium uppercase tracking-wide text-muted">
          Pregunta
        </p>
        <p class="text-sm text-highlighted md:text-base">
          {{ displayQuestionText }}
        </p>
        <p
          v-if="displayQuestionHelpText"
          class="text-xs text-muted md:text-sm"
        >
          {{ displayQuestionHelpText }}
        </p>
      </div>

      <div class="flex flex-wrap gap-3 text-xs text-muted border-b border-default pb-3">
        <span>Respondidas: {{ question.totalAnswers }}</span>
        <span>Sin respuesta: {{ question.skippedCount }}</span>
      </div>
    </div>

    <template v-if="isChoiceQuestion(question)">
      <div
        v-if="question.totalAnswers > 0"
        class="grid gap-4 lg:grid-cols-2"
      >
        <DonutChart
          :data="getChoiceDonutData(question)"
          :categories="getChoiceDonutCategories(question)"
          :radius="120"
          :pad-angle="0.075"
          :height="180"
        />

        <ul class="space-y-2">
          <li
            v-for="item in question.distribution"
            :key="item.option"
            class="flex items-center justify-between rounded-lg border border-default px-3 py-2"
          >
            <span class="text-sm text-highlighted">{{ item.option }}</span>
            <span class="text-xs text-muted">{{ item.count }} ({{ item.percentage }}%)</span>
          </li>
        </ul>
      </div>

      <p
        v-else
        class="text-sm text-muted"
      >
        Aún no hay respuestas para esta pregunta.
      </p>
    </template>

    <template v-else-if="isRatingQuestion(question)">
      <div
        v-if="question.totalAnswers > 0"
        class="space-y-3"
      >
        <p class="text-sm text-muted">
          Promedio: <strong class="text-highlighted">{{ question.average ?? '-' }}</strong> / {{ question.scale }}
        </p>

        <BarChart
          :data="getRatingChartData(question)"
          :categories="ratingChartCategories"
          :yAxis="['count']"
          xAxis="score"
          :height="260"
          hideLegend
        />

        <ul class="space-y-1 text-sm">
          <li
            v-for="item in question.distribution"
            :key="item.value"
            class="flex items-center justify-between"
          >
            <span class="text-highlighted">{{ item.value }}</span>
            <span class="text-muted">{{ item.count }} ({{ item.percentage }}%)</span>
          </li>
        </ul>
      </div>

      <p
        v-else
        class="text-sm text-muted"
      >
        Aún no hay respuestas para esta pregunta.
      </p>
    </template>

    <template v-else-if="isOpenEndedQuestion(question)">
      <div
        v-if="question.responses.length > 0"
        class="space-y-3"
      >
        <ul class="space-y-2">
          <li
            v-for="(response, index) in getOpenEndedVisibleResponses(question)"
            :key="`${question.questionIndex}-${index}-${response}`"
            class="rounded-lg border border-default px-3 py-2 text-sm text-highlighted"
          >
            {{ response }}
          </li>
        </ul>

        <div class="flex items-center justify-between gap-2">
          <UButton
            color="neutral"
            variant="subtle"
            size="sm"
            :disabled="currentOpenEndedPage <= 1"
            @click="setOpenEndedPage(question, currentOpenEndedPage - 1)"
          >
            Anterior
          </UButton>

          <p class="text-xs text-muted">
            Página {{ currentOpenEndedPage }} de {{ getOpenEndedTotalPages(question) }}
          </p>

          <UButton
            color="neutral"
            variant="subtle"
            size="sm"
            :disabled="currentOpenEndedPage >= getOpenEndedTotalPages(question)"
            @click="setOpenEndedPage(question, currentOpenEndedPage + 1)"
          >
            Siguiente
          </UButton>
        </div>
      </div>

      <p
        v-else
        class="text-sm text-muted"
      >
        Aún no hay respuestas para esta pregunta.
      </p>
    </template>
  </UPageCard>
</template>
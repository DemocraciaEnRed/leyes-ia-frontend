<script setup lang="ts">
import { getQuestionTypeLabel } from '~/utils/getQuestionTypeLabel'
import { normalizeSurveyQuestionType } from '~/utils/normalizeSurveyQuestionType'

type QuestionType = 'single-choice' | 'multiple-choice' | 'rating' | 'open-ended'

interface DistributionOption {
  option: string
  count: number
  percentage: number
}

interface DistributionRating {
  value: number
  count: number
  percentage: number
}

interface BaseQuestionResult {
  questionIndex: number
  title: string
  type: QuestionType
  required: boolean
  totalResponses: number
  totalAnswers: number
  skippedCount: number
}

interface ChoiceQuestionResult extends BaseQuestionResult {
  type: 'single-choice' | 'multiple-choice'
  distribution: DistributionOption[]
}

interface RatingQuestionResult extends BaseQuestionResult {
  type: 'rating'
  scale: number
  average: number | null
  distribution: DistributionRating[]
}

interface OpenEndedQuestionResult extends BaseQuestionResult {
  type: 'open-ended'
  responses: string[]
}

type SurveyQuestionResult = ChoiceQuestionResult | RatingQuestionResult | OpenEndedQuestionResult

interface DemographicDistributionItem {
  key: string
  label: string
  count: number
  percentage: number
}

interface SurveyResultsResponse {
  survey: {
    id: number
    title: string
    about?: string | null
    responsesCount?: number
  }
  summary: {
    totalResponses: number
    totalQuestions: number
  }
  questions: SurveyQuestionResult[]
  demographics: {
    totalWithGenre: number
    totalWithAge: number
    totalWithProvince: number
    genre: DemographicDistributionItem[]
    ageRanges: DemographicDistributionItem[]
    provinces: DemographicDistributionItem[]
  }
}

const OPEN_ENDED_PAGE_SIZE = 8
const route = useRoute()

const projectSlug = computed(() => {
  const slugParam = route.params.projectSlug
  return Array.isArray(slugParam) ? slugParam[0] : slugParam
})

const surveyId = computed(() => {
  const surveyIdParam = route.params.surveyId
  const parsedSurveyId = Number(Array.isArray(surveyIdParam) ? surveyIdParam[0] : surveyIdParam)

  if (!Number.isInteger(parsedSurveyId) || parsedSurveyId < 1)
    return null

  return parsedSurveyId
})

const projectDetailHref = computed(() => {
  if (!projectSlug.value)
    return '/proyectos'

  return `/proyectos/${projectSlug.value}`
})

const surveyRuntimeHref = computed(() => {
  if (!projectSlug.value || !surveyId.value)
    return '/proyectos'

  return `/proyectos/${projectSlug.value}/encuestas/${surveyId.value}`
})

const resultsApiPath = computed(() => {
  if (!projectSlug.value || !surveyId.value)
    return '/api/backend/hub/projects/slug/invalid/surveys/0/results'

  return `/api/backend/hub/projects/slug/${projectSlug.value}/surveys/${surveyId.value}/results`
})

const { data, pending, error, refresh } = await useAuthFetch<SurveyResultsResponse>(resultsApiPath.value, {
  immediate: Boolean(projectSlug.value && surveyId.value),
  server: false
})

watch([projectSlug, surveyId], ([nextSlug, nextSurveyId], [prevSlug, prevSurveyId]) => {
  if (!nextSlug || !nextSurveyId)
    return

  if (nextSlug === prevSlug && nextSurveyId === prevSurveyId)
    return

  refresh()
})

const surveyResults = computed(() => data.value || null)
const questions = computed(() => surveyResults.value?.questions || [])

const openEndedPages = ref<Record<number, number>>({})

const isChoiceQuestion = (question: SurveyQuestionResult): question is ChoiceQuestionResult => {
  return question.type === 'single-choice' || question.type === 'multiple-choice'
}

const isRatingQuestion = (question: SurveyQuestionResult): question is RatingQuestionResult => {
  return question.type === 'rating'
}

const isOpenEndedQuestion = (question: SurveyQuestionResult): question is OpenEndedQuestionResult => {
  return question.type === 'open-ended'
}

const getQuestionTypeText = (type: string) => {
  const normalizedType = normalizeSurveyQuestionType(type)
  return getQuestionTypeLabel(normalizedType)
}

const getChoiceDonutCategories = (question: ChoiceQuestionResult) => {
  return question.distribution.reduce<Record<string, { name: string }>>((accumulator, option, index) => {
    accumulator[`option_${index}`] = {
      name: option.option
    }

    return accumulator
  }, {})
}

const getChoiceDonutData = (question: ChoiceQuestionResult) => {
  return question.distribution.map(option => option.count)
}

const ratingChartCategories = {
  count: {
    name: 'Respuestas'
  }
}

const getRatingChartData = (question: RatingQuestionResult) => {
  return question.distribution.map(item => ({
    score: String(item.value),
    count: item.count
  }))
}

const demographicDonutCategories = (items: DemographicDistributionItem[]) => {
  return items.reduce<Record<string, { name: string }>>((accumulator, item, index) => {
    accumulator[`bucket_${index}`] = {
      name: item.label
    }

    return accumulator
  }, {})
}

const demographicDonutData = (items: DemographicDistributionItem[]) => {
  return items.map(item => item.count)
}

const ageChartData = computed(() => {
  return (surveyResults.value?.demographics?.ageRanges || []).map(item => ({
    range: item.label,
    count: item.count
  }))
})

const ageChartCategories = {
  count: {
    name: 'Personas'
  }
}

const provinceDistribution = computed(() => surveyResults.value?.demographics?.provinces || [])

const getOpenEndedTotalPages = (question: OpenEndedQuestionResult) => {
  return Math.max(1, Math.ceil(question.responses.length / OPEN_ENDED_PAGE_SIZE))
}

const getOpenEndedCurrentPage = (questionIndex: number) => {
  return openEndedPages.value[questionIndex] || 1
}

const setOpenEndedPage = (question: OpenEndedQuestionResult, targetPage: number) => {
  const totalPages = getOpenEndedTotalPages(question)
  openEndedPages.value[question.questionIndex] = Math.min(Math.max(targetPage, 1), totalPages)
}

const getOpenEndedVisibleResponses = (question: OpenEndedQuestionResult) => {
  const currentPage = getOpenEndedCurrentPage(question.questionIndex)
  const start = (currentPage - 1) * OPEN_ENDED_PAGE_SIZE
  return question.responses.slice(start, start + OPEN_ENDED_PAGE_SIZE)
}
</script>

<template>
  <NuxtLayout name="default">
    <UContainer>
    <UPage>
        <UPageBody>
        <UPageCard
          variant="outline"
          class="w-full"
          :ui="{ container: 'space-y-4' }"
        >
          <h1 class="text-2xl font-semibold md:text-3xl">
            Resultados de la encuesta
          </h1>
          <p class="text-sm text-muted md:text-base">
            {{ surveyResults?.survey?.title || 'Resumen general de participación' }}
          </p>
          <div class="flex flex-wrap gap-3 text-sm text-muted">
            <span>Respuestas totales: <strong class="text-highlighted">{{ surveyResults?.summary?.totalResponses || 0 }}</strong></span>
            <span>Preguntas: <strong class="text-highlighted">{{ surveyResults?.summary?.totalQuestions || 0 }}</strong></span>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row">
            <UButton
              color="primary"
              class="w-full justify-center rounded-full"
              :to="surveyRuntimeHref"
            >
              Volver a la encuesta
            </UButton>
            <UButton
              color="neutral"
              variant="subtle"
              class="w-full justify-center rounded-full"
              :to="projectDetailHref"
            >
              Volver al proyecto
            </UButton>
          </div>
        </UPageCard>

        <UPageCard
          v-if="pending"
          variant="outline"
          :ui="{ container: 'space-y-2' }"
        >
          <p class="text-sm text-muted">
            Cargando resultados...
          </p>
        </UPageCard>

        <UPageCard
          v-else-if="error"
          variant="outline"
          :ui="{ container: 'space-y-4' }"
        >
          <UAlert
            color="error"
            variant="subtle"
            title="No se pudieron cargar los resultados"
            description="Intenta nuevamente en unos segundos."
          />

          <UButton
            color="primary"
            class="w-full justify-center rounded-full sm:w-auto"
            @click="() => refresh()"
          >
            Reintentar
          </UButton>
        </UPageCard>

        <template v-else>
          <UPageCard
            variant="outline"
            :ui="{ container: 'space-y-4' }"
          >
            <h2 class="text-lg font-semibold md:text-xl">
              Estadística demográfica
            </h2>

            <div class="grid gap-4 lg:grid-cols-2">
              <UPageCard
                variant="subtle"
                :ui="{ container: 'space-y-3' }"
              >
                <h3 class="font-medium">
                  Distribución por género
                </h3>
                <p class="text-xs text-muted">
                  Respondentes con dato de género: {{ surveyResults?.demographics?.totalWithGenre || 0 }}
                </p>

                <div v-if="(surveyResults?.demographics?.genre || []).length > 0" class="space-y-3">
                  <DonutChart
                    :data="demographicDonutData(surveyResults!.demographics.genre)"
                    :categories="demographicDonutCategories(surveyResults!.demographics.genre)"
                    :radius="120"
                    :height="260"
                  />

                  <ul class="space-y-1 text-sm">
                    <li v-for="item in surveyResults?.demographics?.genre || []" :key="item.key" class="flex items-center justify-between">
                      <span class="text-highlighted">{{ item.label }}</span>
                      <span class="text-muted">{{ item.count }} ({{ item.percentage }}%)</span>
                    </li>
                  </ul>
                </div>

                <p v-else class="text-sm text-muted">
                  No hay datos suficientes para mostrar género.
                </p>
              </UPageCard>

              <UPageCard
                variant="subtle"
                :ui="{ container: 'space-y-3' }"
              >
                <h3 class="font-medium">
                  Distribución por edades
                </h3>
                <p class="text-xs text-muted">
                  Respondentes con fecha de nacimiento: {{ surveyResults?.demographics?.totalWithAge || 0 }}
                </p>

                <div v-if="(surveyResults?.demographics?.ageRanges || []).length > 0" class="space-y-3">
                  <BarChart
                    :data="ageChartData"
                    :categories="ageChartCategories"
                    :yAxis="['count']"
                    xAxis="range"
                    :height="260"
                    hideLegend
                  />

                  <ul class="space-y-1 text-sm">
                    <li v-for="item in surveyResults?.demographics?.ageRanges || []" :key="item.key" class="flex items-center justify-between">
                      <span class="text-highlighted">{{ item.label }}</span>
                      <span class="text-muted">{{ item.count }} ({{ item.percentage }}%)</span>
                    </li>
                  </ul>
                </div>

                <p v-else class="text-sm text-muted">
                  No hay datos suficientes para mostrar edades.
                </p>
              </UPageCard>
            </div>

            <UPageCard
              variant="subtle"
              :ui="{ container: 'space-y-3' }"
            >
              <h3 class="font-medium">
                Distribución por provincia
              </h3>
              <p class="text-xs text-muted">
                Respondentes con provincia informada: {{ surveyResults?.demographics?.totalWithProvince || 0 }}
              </p>

              <div v-if="provinceDistribution.length > 0" class="grid gap-4 lg:grid-cols-2">
                <DonutChart
                  :data="demographicDonutData(provinceDistribution)"
                  :categories="demographicDonutCategories(provinceDistribution)"
                  :radius="120"
                  :height="260"
                />

                <div class="overflow-x-auto rounded-lg border border-default">
                  <table class="w-full text-sm">
                    <thead class="bg-elevated/40 text-xs text-muted">
                      <tr>
                        <th class="px-3 py-2 text-left font-medium">
                          Provincia
                        </th>
                        <th class="px-3 py-2 text-right font-medium">
                          Respuestas
                        </th>
                        <th class="px-3 py-2 text-right font-medium">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="item in provinceDistribution"
                        :key="item.key"
                        class="border-t border-default"
                      >
                        <td class="px-3 py-2 text-highlighted">
                          {{ item.label }}
                        </td>
                        <td class="px-3 py-2 text-right text-muted">
                          {{ item.count }}
                        </td>
                        <td class="px-3 py-2 text-right text-muted">
                          {{ item.percentage }}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <p v-else class="text-sm text-muted">
                No hay datos suficientes para mostrar provincias.
              </p>
            </UPageCard>
          </UPageCard>

          <UPageCard
            v-for="question in questions"
            :key="question.questionIndex"
            variant="outline"
            :ui="{ container: 'space-y-4' }"
          >
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-lg font-semibold md:text-xl">
                  Pregunta {{ question.questionIndex + 1 }}
                </h2>
                <UBadge color="neutral" variant="subtle">
                  {{ getQuestionTypeText(question.type) }}
                </UBadge>
                <UBadge v-if="question.required" color="warning" variant="subtle">
                  Obligatoria
                </UBadge>
              </div>

              <p class="text-sm text-highlighted md:text-base">
                {{ question.title }}
              </p>

              <div class="flex flex-wrap gap-3 text-xs text-muted">
                <span>Respondidas: {{ question.totalAnswers }}</span>
                <span>Sin respuesta: {{ question.skippedCount }}</span>
              </div>
            </div>

            <template v-if="isChoiceQuestion(question)">
              <div v-if="question.totalAnswers > 0" class="grid gap-4 lg:grid-cols-2">
                <DonutChart
                  :data="getChoiceDonutData(question)"
                  :categories="getChoiceDonutCategories(question)"
                  :radius="120"
                  :height="260"
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

              <p v-else class="text-sm text-muted">
                Aún no hay respuestas para esta pregunta.
              </p>
            </template>

            <template v-else-if="isRatingQuestion(question)">
              <div v-if="question.totalAnswers > 0" class="space-y-3">
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
                  <li v-for="item in question.distribution" :key="item.value" class="flex items-center justify-between">
                    <span class="text-highlighted">{{ item.value }}</span>
                    <span class="text-muted">{{ item.count }} ({{ item.percentage }}%)</span>
                  </li>
                </ul>
              </div>

              <p v-else class="text-sm text-muted">
                Aún no hay respuestas para esta pregunta.
              </p>
            </template>

            <template v-else-if="isOpenEndedQuestion(question)">
              <div v-if="question.responses.length > 0" class="space-y-3">
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
                    :disabled="getOpenEndedCurrentPage(question.questionIndex) <= 1"
                    @click="setOpenEndedPage(question, getOpenEndedCurrentPage(question.questionIndex) - 1)"
                  >
                    Anterior
                  </UButton>

                  <p class="text-xs text-muted">
                    Página {{ getOpenEndedCurrentPage(question.questionIndex) }} de {{ getOpenEndedTotalPages(question) }}
                  </p>

                  <UButton
                    color="neutral"
                    variant="subtle"
                    size="sm"
                    :disabled="getOpenEndedCurrentPage(question.questionIndex) >= getOpenEndedTotalPages(question)"
                    @click="setOpenEndedPage(question, getOpenEndedCurrentPage(question.questionIndex) + 1)"
                  >
                    Siguiente
                  </UButton>
                </div>
              </div>

              <p v-else class="text-sm text-muted">
                Aún no hay respuestas para esta pregunta.
              </p>
            </template>
          </UPageCard>
        </template>
      </UPageBody>
    </UPage>
    </UContainer>
  </NuxtLayout>
</template>

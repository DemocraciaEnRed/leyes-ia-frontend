<script setup lang="ts">
import type { SurveyResultsResponse } from '~/components/survey/results/types'
import type { ChartColorMode } from '~/utils/chartColors'

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

const surveyQuestionDefinitions = computed(() => surveyResults.value?.survey?.questions || [])

const questionPromptByIndex = computed(() => {
  return surveyQuestionDefinitions.value.reduce<Record<number, string>>((accumulator, question, index) => {
    const prompt = question?.title || question?.questionText

    if (typeof prompt === 'string' && prompt.trim()) {
      accumulator[index] = prompt.trim()
    }

    return accumulator
  }, {})
})

const questionHelpTextByIndex = computed(() => {
  return surveyQuestionDefinitions.value.reduce<Record<number, string>>((accumulator, question, index) => {
    if (typeof question?.helpText === 'string' && question.helpText.trim()) {
      accumulator[index] = question.helpText.trim()
    }

    return accumulator
  }, {})
})

const questionChartColorMode: ChartColorMode = 'indexed'
const demographicChartColorMode: ChartColorMode = 'indexed'
const provinceChartColorMode: ChartColorMode = 'single'
const chartSingleColor = 'var(--ui-primary)'

const pageHeaderLinks = computed(() => {
  const links = []

  if (surveyResults.value) {
    links.push({
      label: 'Volver al proyecto',
      href: projectDetailHref.value,
      icon: 'lucide:arrow-left'
    })

    links.push({
      label: 'Ver encuesta',
      href: surveyRuntimeHref.value,
      icon: 'lucide:eye'
    })
  }

  // Refresh data button
    if (surveyResults.value) {
        links.push({
        label: 'Actualizar resultados',
        onClick: () => refresh(),
        icon: 'lucide:refresh-cw'
        })
    }

  return links
})
</script>

<template>
  <NuxtLayout name="default">
    <UContainer>
      <UPage>
        <UPageHeader
            :headline="surveyResults?.survey.title"
          title="Resultados de la encuesta"
            :links="pageHeaderLinks"
        />
        <UPageBody>
          <SurveyResultsOverviewCard
            :survey-title="surveyResults?.survey?.title"
            :survey-about="surveyResults?.survey?.about"
            :survey-closed-at="surveyResults?.survey?.closedAt"
            :total-responses="surveyResults?.summary?.totalResponses || 0"
            :total-questions="surveyResults?.summary?.totalQuestions || 0"
          />

          <UPageCard
            v-if="pending"
            variant="outline"
            :ui="{ container: 'space-y-4' }"
          >
            <USkeleton class="h-6 w-2/5" />
            <USkeleton class="h-4 w-3/4" />
            <div class="grid gap-3 sm:grid-cols-2">
              <USkeleton class="h-40 w-full rounded-lg" />
              <USkeleton class="h-40 w-full rounded-lg" />
            </div>
            <USkeleton class="h-28 w-full rounded-lg" />
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
            <SurveyResultsDemographicsSection
              :demographics="surveyResults?.demographics"
              :default-color-mode="demographicChartColorMode"
              :province-color-mode="provinceChartColorMode"
              :single-color="chartSingleColor"
            />

            <SurveyResultsQuestionCard
              v-for="question in questions"
              :key="question.questionIndex"
              :question="question"
              :question-prompt="questionPromptByIndex[question.questionIndex] || question.title"
              :question-help-text="questionHelpTextByIndex[question.questionIndex] || ''"
              :color-mode="questionChartColorMode"
              :single-color="chartSingleColor"
            />
          </template>
        </UPageBody>
      </UPage>
    </UContainer>
  </NuxtLayout>
</template>

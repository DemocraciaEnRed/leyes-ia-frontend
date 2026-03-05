<script setup lang="ts">
type SurveyAnswerValue = {
  value: string | string[] | number | null
  openText?: string
}

type SurveyQuestion = {
  id: number
  questionText: string
  type?: string
  required?: boolean
  options?: string[]
  openTextEnabled?: boolean
  scale?: number
  maxLength?: number
}

const props = defineProps<{
  questions: SurveyQuestion[]
  welcomeTitle?: string
  welcomeDescription?: string
  startLabel?: string
  submitAction?: (answers: Record<number, SurveyAnswerValue>) => Promise<void>
}>()

const carousel = useTemplateRef('carousel')
const currentIndex = ref(0)
const hasValidationError = ref(false)
const hasStarted = ref(false)
const isCompleted = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const answers = reactive<Record<number, SurveyAnswerValue>>({})

const totalQuestions = computed(() => props.questions.length)
const currentQuestion = computed(() => props.questions[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value >= totalQuestions.value - 1)
const currentAnswer = computed(() => {
  const questionId = currentQuestion.value?.id

  if (!questionId)
    return null

  return answers[questionId] || { value: null, openText: '' }
})

const normalizedQuestionType = computed(() => {
  const rawType = (currentQuestion.value?.type || '').toLowerCase().trim()

  if (rawType === 'single-choice' || rawType === 'multiple-choice' || rawType === 'rating' || rawType === 'open-ended')
    return rawType

  if (rawType === 'texto')
    return 'open-ended'

  return 'open-ended'
})

const hasAnswerValue = (answer: SurveyAnswerValue | null, questionType: string) => {
  if (!answer)
    return false

  if (questionType === 'multiple-choice') {
    return Array.isArray(answer.value) && answer.value.length > 0
  }

  if (questionType === 'rating') {
    return typeof answer.value === 'number' && Number.isFinite(answer.value)
  }

  return typeof answer.value === 'string' && answer.value.trim().length > 0
}

const canGoNext = computed(() => {
  if (!currentQuestion.value?.required)
    return true

  return hasAnswerValue(currentAnswer.value, normalizedQuestionType.value)
})
const nextButtonLabel = computed(() => isLastQuestion.value ? 'Finalizar' : 'Siguiente')
const nextButtonIcon = computed(() => isLastQuestion.value ? 'lucide:check' : 'lucide:arrow-right')

const getFriendlySubmitError = (error: unknown) => {
  const normalizedError = error as {
    data?: {
      code?: string
      message?: string
      errors?: Array<{ field?: string, message?: string }>
    }
    message?: string
  }

  const errorCode = normalizedError?.data?.code
  const firstValidationError = normalizedError?.data?.errors?.[0]?.message

  if (errorCode === 'DUPLICATE_RESPONSE_USER') {
    return 'Ya registraste una respuesta para esta encuesta.'
  }

  if (errorCode === 'DUPLICATE_RESPONSE_DOCUMENT') {
    return 'Ya existe una respuesta para esta encuesta con ese número de documento.'
  }

  if (errorCode === 'PROFILE_INCOMPLETE') {
    return 'Necesitas completar tu perfil antes de responder esta encuesta.'
  }

  if (errorCode === 'INVALID_RESPONDENT_DATA') {
    return firstValidationError || 'Revisa los datos personales ingresados para continuar.'
  }

  if (errorCode === 'INVALID_ANSWERS') {
    return firstValidationError || 'Revisa tus respuestas: hay preguntas incompletas o inválidas.'
  }

  if (errorCode === 'SURVEY_UNAVAILABLE') {
    return 'Esta encuesta ya no está disponible para responder.'
  }

  if (errorCode === 'AUTH_REQUIRED') {
    return 'Debes iniciar sesión para responder esta encuesta.'
  }

  return normalizedError?.data?.message || normalizedError?.message || 'No se pudo enviar la encuesta. Inténtalo nuevamente.'
}

function onSelect(index: number) {
  currentIndex.value = index
  hasValidationError.value = false
}

function startSurvey() {
  hasStarted.value = true
  isCompleted.value = false
  currentIndex.value = 0
  hasValidationError.value = false
  submitError.value = ''
}

async function finishSurvey() {
  submitError.value = ''

  if (props.submitAction) {
    try {
      isSubmitting.value = true
      await props.submitAction({ ...answers })
    } catch (error: unknown) {
      submitError.value = getFriendlySubmitError(error)
      return
    } finally {
      isSubmitting.value = false
    }
  }

  isCompleted.value = true
  hasValidationError.value = false
}

async function goToNext() {
  if (!canGoNext.value) {
    hasValidationError.value = true
    return
  }

  if (isLastQuestion.value) {
    await finishSurvey()
    return
  }

  carousel.value?.emblaApi?.scrollNext()
}

async function goToPrevious() {
  carousel.value?.emblaApi?.scrollPrev()
}

const isFirstQuestion = computed(() => currentIndex.value === 0)

function updateCurrentAnswer(value: SurveyAnswerValue) {
  const questionId = currentQuestion.value?.id

  if (!questionId)
    return

  answers[questionId] = {
    value: value?.value ?? null,
    openText: value?.openText || ''
  }
  hasValidationError.value = false
}
</script>

<template>
  <div class="flex min-h-screen h-screen items-center justify-center bg-accented px-4 pb-6 pt-20 sm:px-6">
    <UPageCard
      v-if="!hasStarted"
      variant="outline"
      class="mx-auto w-full max-w-3xl p-8"
      :ui="{ container: 'space-y-4' }"
    >
      <h1 class="text-2xl font-semibold md:text-3xl">
        {{ welcomeTitle || 'Encuesta ciudadana' }}
      </h1>
      <p class="text-sm text-muted md:text-base">
        {{ welcomeDescription || 'Tu opinión nos ayuda a mejorar esta propuesta. Te tomará menos de 2 minutos.' }}
      </p>
      <UButton
        color="primary"
        size="lg"
        trailing-icon="lucide:play"
        @click="startSurvey"
      >
        {{ startLabel || 'Comenzar' }}
      </UButton>
    </UPageCard>

    <UPageCard
      v-else-if="isCompleted"
      variant="outline"
      class="mx-auto w-full max-w-3xl p-8"
      :ui="{ container: 'space-y-4' }"
    >
      <h1 class="text-2xl font-semibold md:text-3xl">
        ¡Gracias por participar!
      </h1>
      <p class="text-sm text-muted md:text-base">
        Tu respuesta fue registrada. Valoramos mucho tu tiempo y aporte.
      </p>
    </UPageCard>

    <div
      v-else
      class="flex h-full w-full max-w-3xl flex-col justify-between space-y-4 md:h-2/3 lg:h-2/3"
    >
      <UCarousel
        ref="carousel"
        v-slot="{ item, index }"
        :items="questions"
        :arrows="false"
        :dots="false"
        :watch-drag="false"
        :ui="{
          item: 'basis-full h-full',
          root: 'h-full',
          viewport: 'h-full',
          container: 'h-full'
        }"
        @select="onSelect"
      >
        <SurveyCard
          :question="item"
          :index="index"
          :total="totalQuestions"
          :model-value="answers[item.id] || { value: null, openText: '' }"
          @update:model-value="updateCurrentAnswer"
        />
      </UCarousel>

      <UAlert
        v-if="hasValidationError"
        color="warning"
        variant="soft"
        icon="lucide:triangle-alert"
        title="Completa esta pregunta para continuar"
        description="Esta pregunta está marcada como obligatoria."
        class="mx-auto w-full"
      />

      <UAlert
        v-if="submitError"
        color="error"
        variant="soft"
        icon="lucide:circle-alert"
        title="No se pudo enviar la encuesta"
        :description="submitError"
        class="mx-auto w-full"
      />

      <div class="mx-auto flex w-full items-center justify-between gap-2">
        <UButton
          color="neutral"
          variant="solid"
          class="rounded-full"
          size="xl"
          :disabled="isFirstQuestion"
          icon="lucide:arrow-left"
          @click="goToPrevious"
        />
        <UButton
          color="primary"
          class="w-full rounded-full justify-center"
          size="xl"
          :loading="isSubmitting"
          :disabled="!canGoNext || isSubmitting"
          :trailing-icon="nextButtonIcon"
          @click="goToNext"
        >
          {{ nextButtonLabel }}
        </UButton>
          
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type SurveyQuestion = {
  id: number
  questionText: string
  type?: string
  required?: boolean
}

const props = defineProps<{
  questions: SurveyQuestion[]
}>()

const carousel = useTemplateRef('carousel')
const currentIndex = ref(0)
const hasValidationError = ref(false)
const hasStarted = ref(false)
const isCompleted = ref(false)
const answers = reactive<Record<number, string>>({})

const totalQuestions = computed(() => props.questions.length)
const currentQuestion = computed(() => props.questions[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value >= totalQuestions.value - 1)
const currentAnswer = computed(() => {
  const questionId = currentQuestion.value?.id

  if (!questionId)
    return ''

  return answers[questionId] || ''
})
const canGoNext = computed(() => {
  if (!currentQuestion.value?.required)
    return true

  return currentAnswer.value.trim().length > 0
})
const nextButtonLabel = computed(() => isLastQuestion.value ? 'Finalizar' : 'Siguiente')
const nextButtonIcon = computed(() => isLastQuestion.value ? 'lucide:check' : 'lucide:arrow-right')

function onSelect(index: number) {
  currentIndex.value = index
  hasValidationError.value = false
}

function startSurvey() {
  hasStarted.value = true
  isCompleted.value = false
  currentIndex.value = 0
  hasValidationError.value = false
}

function finishSurvey() {
  isCompleted.value = true
  hasValidationError.value = false
}

function goToNext() {
  if (!canGoNext.value) {
    hasValidationError.value = true
    return
  }

  if (isLastQuestion.value) {
    finishSurvey()
    return
  }

  carousel.value?.emblaApi?.scrollNext()
}

function updateCurrentAnswer(value: string) {
  const questionId = currentQuestion.value?.id

  if (!questionId)
    return

  answers[questionId] = value
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
        Encuesta ciudadana
      </h1>
      <p class="text-sm text-muted md:text-base">
        Tu opinión nos ayuda a mejorar esta propuesta. Te tomará menos de 2 minutos.
      </p>
      <UButton
        color="primary"
        size="lg"
        trailing-icon="lucide:play"
        @click="startSurvey"
      >
        Comenzar
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
          :model-value="answers[item.id] || ''"
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

      <div class="mx-auto flex flex-col w-full items-center justify-between gap-3">
        <UButton
          color="primary"
          class="w-full rounded-full justify-center"
          size="xl"
          :disabled="!canGoNext"
          :trailing-icon="nextButtonIcon"
          @click="goToNext"
        >
          {{ nextButtonLabel }}
        </UButton>
        <!-- <UButton
          color="neutral"
          variant="outline"
          :disabled="isFirstQuestion"
          icon="lucide:arrow-left"
          @click="goToPrevious"
        >
          Anterior
        </UButton> -->
      </div>
    </div>
  </div>
</template>

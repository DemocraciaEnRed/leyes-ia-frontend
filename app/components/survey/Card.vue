<script setup lang="ts">
type SurveyAnswerValue = {
  value: string | string[] | number | null
  openText?: string
}

type SurveyQuestionCard = {
  id: number
  questionText: string
  type?: string
  required?: boolean
  helpText?: string
  options?: string[]
  openTextEnabled?: boolean
  scale?: number
  maxLength?: number
}

const props = defineProps<{
  question: SurveyQuestionCard
  index: number
  total: number
  modelValue: SurveyAnswerValue
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SurveyAnswerValue]
}>()

const normalizedType = computed(() => {
  const rawType = (props.question.type || '').toLowerCase().trim()

  if (rawType === 'single-choice' || rawType === 'multiple-choice' || rawType === 'rating' || rawType === 'open-ended')
    return rawType

  if (rawType === 'texto')
    return 'open-ended'

  return 'open-ended'
})

const selectedSingleChoice = computed({
  get: () => typeof props.modelValue?.value === 'string' ? props.modelValue.value : '',
  set: value => emit('update:modelValue', {
    ...props.modelValue,
    value
  })
})

const selectedMultipleChoices = computed(() => {
  return Array.isArray(props.modelValue?.value) ? props.modelValue.value : []
})

const openEndedAnswer = computed({
  get: () => typeof props.modelValue?.value === 'string' ? props.modelValue.value : '',
  set: value => emit('update:modelValue', {
    ...props.modelValue,
    value
  })
})

const ratingAnswer = computed(() => {
  return typeof props.modelValue?.value === 'number' ? props.modelValue.value : null
})

const openTextAnswer = computed({
  get: () => props.modelValue?.openText || '',
  set: value => emit('update:modelValue', {
    ...props.modelValue,
    openText: value
  })
})

const ratingScale = computed(() => {
  const parsedScale = Number(props.question.scale)

  if (Number.isInteger(parsedScale) && parsedScale > 1 && parsedScale <= 10) {
    return parsedScale
  }

  return 5
})

const ratingOptions = computed(() => {
  return Array.from({ length: ratingScale.value }, (_, index) => index + 1)
})

const maxLength = computed(() => {
  const parsedMaxLength = Number(props.question.maxLength)
  if (Number.isInteger(parsedMaxLength) && parsedMaxLength > 0) {
    return parsedMaxLength
  }

  return undefined
})

const toggleMultiOption = (option: string) => {
  const current = new Set(selectedMultipleChoices.value)
  if (current.has(option)) {
    current.delete(option)
  } else {
    current.add(option)
  }

  emit('update:modelValue', {
    ...props.modelValue,
    value: Array.from(current)
  })
}

const selectRating = (value: number) => {
  emit('update:modelValue', {
    ...props.modelValue,
    value
  })
}
</script>

<template>
  <UPageCard
    variant="outline"
    class="mx-auto h-full w-full gap-4 p-2"
    :ui="{
      container: 'flex! flex-col justify-between'
    }"
  >
    <div class="w-full space-y-2">
      <div class="flex items-center justify-between gap-3">
        <UBadge
          color="primary"
          variant="soft"
        >
          Pregunta {{ index + 1 }} de {{ total }}
        </UBadge>

        <UBadge
          v-if="question.type"
          color="neutral"
          variant="outline"
        >
          {{ question.type }}
        </UBadge>

        <UBadge
          v-if="question.required"
          color="warning"
          variant="soft"
        >
          Obligatoria
        </UBadge>
      </div>

      <h2 class="text-lg font-semibold leading-tight md:text-2xl">
        {{ question.questionText }}
      </h2>

      <p
        v-if="question.helpText"
        class="text-sm text-muted"
      >
        {{ question.helpText }}
      </p>
    </div>

    <div class="space-y-4">
      <div
        v-if="normalizedType === 'single-choice'"
        class="flex flex-col gap-2"
      >
        <UButton
          v-for="option in (question.options || [])"
          :key="option"
          :variant="selectedSingleChoice === option ? 'solid' : 'subtle'"
          class="rounded-full justify-center"
          color="neutral"
          @click="selectedSingleChoice = option"
        >
          {{ option }}
        </UButton>
      </div>

      <div
        v-else-if="normalizedType === 'multiple-choice'"
        class="flex flex-wrap gap-2"
      >
        <UButton
          v-for="option in (question.options || [])"
          :key="option"
          :variant="selectedMultipleChoices.includes(option) ? 'solid' : 'outline'"
          color="primary"
          class="rounded-full"
          @click="toggleMultiOption(option)"
        >
          {{ option }}
        </UButton>
      </div>

      <div
        v-else-if="normalizedType === 'rating'"
        class="flex flex-wrap gap-2"
      >
        <UButton
          v-for="option in ratingOptions"
          :key="option"
          :variant="ratingAnswer === option ? 'solid' : 'outline'"
          color="primary"
          class="rounded-full"
          @click="selectRating(option)"
        >
          {{ option }}
        </UButton>
      </div>

      <UTextarea
        v-else
        v-model="openEndedAnswer"
        autoresize
        :rows="4"
        class="w-full"
        :max-length="maxLength"
        placeholder="Escribe aquí tu respuesta..."
      />

      <UTextarea
        v-if="question.openTextEnabled && normalizedType !== 'open-ended'"
        v-model="openTextAnswer"
        autoresize
        :rows="3"
        class="w-full"
        placeholder="¿Querés agregar un comentario opcional?"
      />
    </div>
  </UPageCard>
</template>

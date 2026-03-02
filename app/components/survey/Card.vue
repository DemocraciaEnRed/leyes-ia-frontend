<script setup lang="ts">
type SurveyQuestionCard = {
  id: number
  questionText: string
  type?: string
  required?: boolean
  helpText?: string
}

const props = defineProps<{
  question: SurveyQuestionCard
  index: number
  total: number
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const answer = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})
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
    <UTextarea
      v-model="answer"
      autoresize
      :rows="4"
      placeholder="Escribe aquí tu respuesta..."
    />
  </UPageCard>
</template>

<script setup lang="ts">
import { QUESTION_TYPE_OPTIONS, getQuestionTypeLabel } from '~/utils/getQuestionTypeLabel'
import type { QuestionType } from '~/utils/getQuestionTypeLabel'

type SurveyQuestion = {
  questionText?: string
  type?: string
  required?: boolean
  helpText?: string
  options?: string[]
  scale?: number
  maxLength?: number
}

const props = withDefaults(defineProps<{
  question: SurveyQuestion
  index: number
  mode?: 'view' | 'edit'
  canMoveUp?: boolean
  canMoveDown?: boolean
  canDelete?: boolean
  canEdit?: boolean
  actionDisabled?: boolean
}>(), {
  mode: 'view',
  canMoveUp: true,
  canMoveDown: true,
  canDelete: true,
  canEdit: true,
  actionDisabled: false
})

const emit = defineEmits<{
  edit: []
  cancel: []
  save: [payload: SurveyQuestion]
  moveUp: []
  moveDown: []
  delete: []
}>()

const draftQuestionText = ref('')
const draftHelpText = ref('')
const draftType = ref<QuestionType>('single-choice')
const draftOptions = ref<string[]>([])
const optionValidationError = ref('')
const questionTypeItems = computed(() => [...QUESTION_TYPE_OPTIONS])
const isChoiceType = computed(() => draftType.value === 'single-choice' || draftType.value === 'multiple-choice')

const addOption = () => {
  draftOptions.value.push('')
}

const removeOption = (index: number) => {
  draftOptions.value.splice(index, 1)
}

watch(
  () => [props.mode, props.question],
  () => {
    draftQuestionText.value = props.question?.questionText || ''
    draftHelpText.value = props.question?.helpText || ''
    if (props.question?.type === 'single-choice' || props.question?.type === 'multiple-choice' || props.question?.type === 'open-ended' || props.question?.type === 'rating') {
      draftType.value = props.question.type
    } else {
      draftType.value = 'single-choice'
    }

    const sourceOptions = Array.isArray(props.question?.options)
      ? props.question.options.filter(option => typeof option === 'string')
      : []

    if (sourceOptions.length > 0) {
      draftOptions.value = [...sourceOptions]
    } else if (draftType.value === 'single-choice' || draftType.value === 'multiple-choice') {
      draftOptions.value = ['Sí', 'No', 'No sé']
    } else {
      draftOptions.value = []
    }

    optionValidationError.value = ''
  },
  { immediate: true, deep: true }
)

const saveEdition = () => {
  const normalizedOptions = draftOptions.value
    .map(option => option.trim())
    .filter(option => option.length > 0)

  if (isChoiceType.value && normalizedOptions.length < 2) {
    optionValidationError.value = 'Debes definir al menos 2 opciones no vacías.'
    return
  }

  if (isChoiceType.value) {
    const normalizedKeys = normalizedOptions.map(option => option.toLocaleLowerCase())
    const hasDuplicates = new Set(normalizedKeys).size !== normalizedKeys.length

    if (hasDuplicates) {
      optionValidationError.value = 'Las opciones no pueden estar duplicadas.'
      return
    }
  }

  optionValidationError.value = ''
  draftOptions.value = [...normalizedOptions]

  emit('save', {
    ...props.question,
    questionText: draftQuestionText.value,
    helpText: draftHelpText.value || undefined,
    type: draftType.value,
    options: isChoiceType.value ? normalizedOptions : undefined
  })
}
</script>

<template>
  <UPageCard
    variant="outline"
    class=""
  >
    <div class="flex justify-between items-start gap-4">
      <div class="flex-1 space-y-3">
        <template v-if="mode === 'edit'">
          <div class="flex items-center gap-2">
            <UBadge
              color="primary"
              variant="subtle"
            >
              {{ index + 1 }}
            </UBadge>
            <span class="text-sm text-muted animate-pulse">Modo edición</span>
          </div>

          <UFormField label="Pregunta">
            <UTextarea
              v-model="draftQuestionText"
              class="w-full"
              autoresize
              :rows="2"
              placeholder="Escribe la pregunta"
            />
          </UFormField>

          <UFormField label="Texto de ayuda">
            <UTextarea
              v-model="draftHelpText"
              class="w-full"
              autoresize
              :rows="2"
              placeholder="Opcional"
            />
          </UFormField>

          <UFormField label="Tipo de respuesta">
            <URadioGroup
              v-model="draftType"
              :items="questionTypeItems"
              variant="table"
            />
          </UFormField>

          <UFormField
            v-if="isChoiceType"
            label="Opciones"
          >
            <div class="space-y-2">
              <div
                v-for="(option, optionIndex) in draftOptions"
                :key="`option-${optionIndex}`"
                class="flex items-center gap-2"
              >
                <UInput
                  v-model="draftOptions[optionIndex]"
                  class="w-full"
                  :placeholder="`Opción ${optionIndex + 1}`"
                />
                <UButton
                  icon="lucide:trash-2"
                  color="warning"
                  variant="outline"
                  size="sm"
                  :disabled="draftOptions.length <= 1"
                  @click="removeOption(optionIndex)"
                />
              </div>

              <UButton
                icon="lucide:plus-circle"
                color="neutral"
                variant="outline"
                size="sm"
                @click="addOption"
              >
                Agregar opción
              </UButton>

              <UAlert
                v-if="optionValidationError"
                color="error"
                variant="subtle"
                icon="lucide:alert-circle"
                :description="optionValidationError"
              />
            </div>
          </UFormField>
        </template>

        <template v-else>
          <div class="flex items-start gap-3">
            <UBadge
              color="primary"
              variant="subtle"
            >
              {{ index + 1 }}
            </UBadge>
            <div class="flex-1">
              <h3 class="text-lg font-semibold">
                {{ question.questionText }}
              </h3>
            </div>
          </div>

          <div
            v-if="question.helpText"
            class="text-sm text-gray-600 dark:text-gray-400"
          >
            {{ question.helpText }}
          </div>

          <div class="flex gap-2 flex-wrap">
            <UBadge
              color="neutral"
              variant="subtle"
            >
              {{ getQuestionTypeLabel(question.type) }}
            </UBadge>
            <UBadge
              v-if="question.scale"
              color="neutral"
              variant="subtle"
            >
              Escala: 1-{{ question.scale }}
            </UBadge>
            <UBadge
              v-if="question.maxLength"
              color="neutral"
              variant="subtle"
            >
              Máx: {{ question.maxLength }} caracteres
            </UBadge>
            <UBadge
              v-if="question.required"
              color="error"
              variant="subtle"
            >
              Obligatoria
            </UBadge>
            <UBadge
              v-else
              color="neutral"
              variant="subtle"
            >
              Opcional
            </UBadge>
          </div>

          <div
            v-if="question.options && question.options.length > 0"
            class="space-y-1"
          >
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Opciones:
            </p>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li
                v-for="(option, optIndex) in question.options"
                :key="optIndex"
              >
                {{ option }}
              </li>
            </ul>
          </div>
        </template>
      </div>

      <div class="flex flex-col gap-2">
        <template v-if="mode === 'edit'">
          <UButton
            icon="lucide:check"
            class="cursor-pointer"
            color="success"
            variant="solid"
            size="sm"
            :disabled="actionDisabled"
            @click="saveEdition"
          />
          <UButton
            icon="lucide:x"
            class="cursor-pointer"
            color="neutral"
            variant="outline"
            size="sm"
            :disabled="actionDisabled"
            @click="emit('cancel')"
          />
        </template>

        <template v-else>
          <UButton
            v-if="canEdit"
            icon="lucide:pencil"
            class="cursor-pointer"
            color="neutral"
            variant="outline"
            size="sm"
            :disabled="actionDisabled"
            @click="emit('edit')"
          />
          <UButton
            icon="lucide:arrow-up"
            class="cursor-pointer"
            color="neutral"
            variant="outline"
            size="sm"
            :disabled="!canMoveUp || actionDisabled"
            @click="emit('moveUp')"
          />
          <UButton
            icon="lucide:arrow-down"
            class="cursor-pointer"
            color="neutral"
            variant="outline"
            size="sm"
            :disabled="!canMoveDown || actionDisabled"
            @click="emit('moveDown')"
          />
          <UButton
            v-if="canDelete"
            icon="lucide:trash-2"
            class="cursor-pointer"
            color="warning"
            variant="outline"
            size="sm"
            :disabled="actionDisabled"
            @click="emit('delete')"
          />
        </template>
      </div>
    </div>
  </UPageCard>
</template>

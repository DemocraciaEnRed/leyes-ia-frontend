<script setup lang="ts">
type SurveyQuestion = {
  questionText?: string
  type?: string
  required?: boolean
  helpText?: string
  options?: string[]
  scale?: number
  maxLength?: number
}

withDefaults(defineProps<{
  title: string
  description?: string
  questions: SurveyQuestion[]
  editingIndex?: number | null
  canAdd?: boolean
  canEdit?: boolean
  canReorder?: boolean
  canDelete?: boolean
  actionDisabled?: boolean
  addLabel?: string
  emptyTitle?: string
  emptyDescription?: string
}>(), {
  description: '',
  editingIndex: null,
  canAdd: true,
  canEdit: true,
  canReorder: true,
  canDelete: true,
  actionDisabled: false,
  addLabel: 'Nuevo item',
  emptyTitle: 'No hay preguntas',
  emptyDescription: 'No se han generado preguntas aún.'
})

const emit = defineEmits<{
  add: []
  edit: [index: number]
  save: [index: number, payload: SurveyQuestion]
  cancel: []
  moveUp: [index: number]
  moveDown: [index: number]
  delete: [index: number]
}>()
</script>

<template>
  <UPageCard
    variant="subtle"
    :title="title"
    :description="description"
  >
    <UEmpty
      v-if="!questions?.length"
      variant="naked"
      icon="lucide:circle-slash"
      :title="emptyTitle"
      class="mx-auto"
      :description="emptyDescription"
    />

    <SurveyQuestionItemCard
      v-for="(question, index) in questions"
      :key="index"
      :question="question"
      :index="index"
      :mode="editingIndex === index ? 'edit' : 'view'"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :can-move-up="canReorder && index > 0"
      :can-move-down="canReorder && index < questions.length - 1"
      :action-disabled="actionDisabled"
      @edit="emit('edit', index)"
      @save="emit('save', index, $event)"
      @cancel="emit('cancel')"
      @move-up="emit('moveUp', index)"
      @move-down="emit('moveDown', index)"
      @delete="emit('delete', index)"
    />

    <UButton
      v-if="canAdd"
      color="neutral"
      variant="outline"
      icon="lucide:plus-circle"
      :disabled="actionDisabled"
      class="w-full justify-center"
      @click="emit('add')"
    >
      {{ addLabel }}
    </UButton>

    <slot name="footer" />
  </UPageCard>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  question?: string
  bodyText?: string
  acceptLabel?: string
  cancelLabel?: string
}>(), {
  question: 'Confirmar acción',
  bodyText: '',
  acceptLabel: 'Aceptar',
  cancelLabel: 'Cancelar'
})

const emit = defineEmits<{ close: [boolean] }>()
const modalDescription = computed(() => props.bodyText || '¿Deseas continuar con esta acción?')

const handleConfirm = () => emit('close', true)
const handleCancel = () => emit('close', false)
</script>

<template>
  <UModal
    :dismissible="false"
    :title="question"
    :description="modalDescription"
    :close="{ onClick: handleCancel }"
  >
    <template #footer>
      <div class="w-full flex justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          @click="handleCancel"
        >
          {{ cancelLabel }}
        </UButton>
        <UButton
          color="error"
          @click="handleConfirm"
        >
          {{ acceptLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

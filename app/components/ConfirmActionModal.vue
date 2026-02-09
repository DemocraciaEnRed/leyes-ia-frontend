<script setup lang="ts">
const props = defineProps({
  question: {
    type: String,
    default: 'Confirmar acción',
  },
  bodyText: {
    type: String,
    default: '',
  },
  acceptLabel: {
    type: String,
    default: 'Aceptar',
  },
  cancelLabel: {
    type: String,
    default: 'Cancelar',
  },
});

const emit = defineEmits<{ close: [boolean] }>();

const handleConfirm = () => emit('close', true);
const handleCancel = () => emit('close', false);
</script>

<template>
  <UModal :dismissible="false" :close="{ onClick: handleCancel }">
    <UCard>
      <template #header>
        <div class="flex items-start gap-3">
          <UIcon name="lucide:help-circle" class="h-5 w-5 text-primary-500" />
          <div class="flex-1">
            <h3 class="text-lg font-semibold">{{ question }}</h3>
          </div>
        </div>
      </template>

      <p class="text-sm text-gray-600 dark:text-gray-300">
        {{ bodyText }}
      </p>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="handleCancel">
            {{ cancelLabel }}
          </UButton>
          <UButton color="error" @click="handleConfirm">
            {{ acceptLabel }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

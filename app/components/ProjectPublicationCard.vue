<script setup lang="ts">
interface ProjectPublicationData {
  id?: string | number
  name?: string
  status?: string
  publishedAt?: string | null
  summaryIncompleteFields?: string[]
}

const props = defineProps<{
  projectId: string
  project?: ProjectPublicationData
}>()

const emit = defineEmits<{
  updated: []
}>()

const toast = useToast()

const actionLoading = ref(false)
const confirmActionOpen = ref(false)
const missingFieldsModalOpen = ref(false)
const actionToConfirm = ref<'publish' | 'unpublish' | null>(null)

const requiredFieldLabels: Record<string, string> = {
  title: 'Título',
  category: 'Categoría',
  description: 'Descripción',
  summary: 'Resumen',
  content: 'Contenido',
  proposed_questions: 'Preguntas propuestas'
}

const isPublished = computed(() => Boolean(props.project?.publishedAt))
const isCreatedStatus = computed(() => props.project?.status === 'created')

const summaryIncompleteFields = computed<string[]>(() => {
  const fields = props.project?.summaryIncompleteFields
  return Array.isArray(fields) ? fields : []
})

const summaryIncompleteFieldsLabels = computed(() => {
  return summaryIncompleteFields.value.map(field => requiredFieldLabels[field] || field)
})

const canPublish = computed(() => {
  return !isPublished.value && !isCreatedStatus.value && summaryIncompleteFields.value.length === 0
})

const openConfirmAction = (action: 'publish' | 'unpublish') => {
  actionToConfirm.value = action
  confirmActionOpen.value = true
}

watch(confirmActionOpen, (isOpen) => {
  if (!isOpen && !actionLoading.value) {
    actionToConfirm.value = null
  }
})

const closeConfirmModal = () => {
  if (actionLoading.value) {
    return
  }
  confirmActionOpen.value = false
  actionToConfirm.value = null
}

const executeConfirmedAction = async () => {
  if (!actionToConfirm.value) {
    return
  }

  confirmActionOpen.value = false

  actionLoading.value = true
  try {
    const endpoint = actionToConfirm.value === 'publish'
      ? `/api/backend/projects/${props.projectId}/manage/publish`
      : `/api/backend/projects/${props.projectId}/manage/unpublish`

    await $authFetch(endpoint, { method: 'POST' })

    toast.add({
      icon: 'lucide:check-circle',
      color: 'success',
      title: actionToConfirm.value === 'publish' ? 'Proyecto publicado' : 'Proyecto despublicado',
      description: actionToConfirm.value === 'publish'
        ? 'El proyecto ahora está publicado.'
        : 'El proyecto dejó de estar publicado.'
    })

    emit('updated')
  } catch (fetchError: any) {
    const backendMessage = fetchError?.data?.message || fetchError?.message || 'No se pudo completar la acción.'
    toast.add({
      icon: 'lucide:alert-circle',
      color: 'error',
      title: 'No se pudo completar la acción',
      description: backendMessage
    })
    emit('updated')
  } finally {
    actionLoading.value = false
    actionToConfirm.value = null
  }
}
</script>

<template>
  <UPageCard
    variant="outline"
    class="bg-elevated"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold">
            Publicación
          </h3>
          <p class="text-sm text-muted">
            Controla si el proyecto está visible para los ciudadanos.
          </p>
        </div>
        <UBadge
          :color="isPublished ? 'success' : 'neutral'"
          variant="subtle"
          size="lg"
        >
          {{ isPublished ? 'Publicado' : 'No publicado' }}
        </UBadge>
      </div>

      <div
        v-if="isCreatedStatus"
        class="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-900 dark:text-warning-200"
      >
        El proyecto sigue en estado creado. Completá y guardá el resumen para cambiar su estado.
      </div>

      <div
        v-if="summaryIncompleteFieldsLabels.length > 0"
        class="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3"
      >
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p class="text-sm text-warning-900 dark:text-warning-200">
            Faltan {{ summaryIncompleteFieldsLabels.length }} campos del resumen para poder publicar.
          </p>
          <UButton
            size="sm"
            color="warning"
            variant="soft"
            icon="lucide:list-checks"
            @click="missingFieldsModalOpen = true"
          >
            Ver faltantes
          </UButton>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          color="primary"
          icon="lucide:upload"
          :loading="actionLoading && actionToConfirm === 'publish'"
          :disabled="actionLoading || !canPublish"
          @click="openConfirmAction('publish')"
        >
          Publicar
        </UButton>

        <UButton
          color="neutral"
          variant="outline"
          icon="lucide:download"
          :loading="actionLoading && actionToConfirm === 'unpublish'"
          :disabled="actionLoading || !isPublished"
          @click="openConfirmAction('unpublish')"
        >
          Despublicar
        </UButton>
      </div>
    </div>
  </UPageCard>

  <UModal
    v-model:open="missingFieldsModalOpen"
    title="Campos faltantes del resumen"
    description="Completá estos campos para habilitar la publicación del proyecto."
  >
    <template #body>
      <ul class="list-disc pl-5 space-y-1 text-sm">
        <li
          v-for="fieldLabel in summaryIncompleteFieldsLabels"
          :key="fieldLabel"
        >
          {{ fieldLabel }}
        </li>
      </ul>
    </template>

    <template #footer>
      <div class="w-full flex justify-end">
        <UButton
          color="neutral"
          variant="outline"
          @click="missingFieldsModalOpen = false"
        >
          Entendido
        </UButton>
      </div>
    </template>
  </UModal>

  <UModal
    v-model:open="confirmActionOpen"
    :dismissible="!actionLoading"
    :title="actionToConfirm === 'publish' ? '¿Publicar proyecto?' : '¿Despublicar proyecto?'"
    :description="actionToConfirm === 'publish'
      ? 'El proyecto quedará visible para los ciudadanos en el Hub público.'
      : 'El proyecto dejará de estar visible en el Hub público.'"
  >
    <template #footer>
      <div class="w-full flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          :disabled="actionLoading"
          @click="closeConfirmModal"
        >
          Cancelar
        </UButton>
        <UButton
          color="primary"
          :loading="actionLoading"
          :disabled="actionLoading"
          @click="executeConfirmedAction"
        >
          {{ actionToConfirm === 'publish' ? 'Publicar' : 'Despublicar' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

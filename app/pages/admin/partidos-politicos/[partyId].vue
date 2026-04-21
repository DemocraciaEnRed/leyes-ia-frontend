<script setup lang="ts">
import type { PoliticalParty, PoliticalPartyFile, PoliticalPartyLegislator } from '~/shared/types/politicalParty'
import ConfirmActionModal from '~/components/ConfirmActionModal.vue'

definePageMeta({
  layout: 'panel-admin',
  middleware: 'admin'
})

const toast = useToast()
const route = useRoute()
const partyId = route.params.partyId
const overlay = useOverlay()
const confirmModal = overlay.create(ConfirmActionModal)

// Fetch party
const { data: partyData, refresh } = await useAuthFetch<{ party: PoliticalParty }>(
  `/api/backend/admin/political-parties/${partyId}`
)

const party = computed(() => partyData.value?.party)

// Edit form
const form = ref({
  name: '',
  slug: '',
  shortName: '',
  logoUrl: '',
  status: 'draft',
})

watch(party, (p) => {
  if (!p) return
  form.value = {
    name: p.name,
    slug: p.slug,
    shortName: p.shortName || '',
    logoUrl: p.logoUrl || '',
    status: p.status,
  }
}, { immediate: true })

const isSubmitting = ref(false)

async function handleUpdate() {
  if (!form.value.name.trim() || !form.value.slug.trim()) {
    toast.add({ color: 'error', title: 'El nombre y slug son requeridos' })
    return
  }
  isSubmitting.value = true
  try {
    await $authFetch(`/api/backend/admin/political-parties/${partyId}`, {
      method: 'PATCH',
      body: {
        name: form.value.name.trim(),
        slug: form.value.slug.trim(),
        shortName: form.value.shortName.trim() || null,
        logoUrl: form.value.logoUrl.trim() || null,
        status: form.value.status,
      },
    })
    toast.add({ color: 'success', title: 'Partido actualizado' })
    await refresh()
  } catch (error: any) {
    toast.add({ color: 'error', title: error?.data?.message || 'Error al actualizar' })
  } finally {
    isSubmitting.value = false
  }
}

// Files
const fileInput = ref<HTMLInputElement>()
const isUploading = ref(false)

async function uploadFile() {
  const file = fileInput.value?.files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'platform')

    await $authFetch(`/api/backend/admin/political-parties/${partyId}/files`, {
      method: 'POST',
      body: formData,
    })
    toast.add({ color: 'success', title: 'Archivo subido' })
    if (fileInput.value) fileInput.value.value = ''
    await refresh()
  } catch (error: any) {
    toast.add({ color: 'error', title: error?.data?.message || 'Error al subir archivo' })
  } finally {
    isUploading.value = false
  }
}

async function deleteFile(file: PoliticalPartyFile) {
  const instance = confirmModal.open({
    question: 'Eliminar archivo',
    bodyText: `¿Eliminar "${file.name}"?`,
    acceptLabel: 'Eliminar',
    cancelLabel: 'Cancelar',
  })
  const confirmed = await instance.result
  if (!confirmed) return

  try {
    await $authFetch(`/api/backend/admin/political-parties/${partyId}/files/${file.id}`, {
      method: 'DELETE',
    })
    toast.add({ color: 'success', title: 'Archivo eliminado' })
    await refresh()
  } catch (error: any) {
    toast.add({ color: 'error', title: error?.data?.message || 'Error al eliminar archivo' })
  }
}

// Profile generation
const isGeneratingProfile = ref(false)
const expandWithSearch = ref(false)

async function generateProfile() {
  isGeneratingProfile.value = true
  try {
    await $authFetch(`/api/backend/admin/political-parties/${partyId}/generate-profile`, {
      method: 'POST',
      body: { expandWithSearch: expandWithSearch.value },
    })
    toast.add({ color: 'success', title: 'Perfil generado exitosamente' })
    await refresh()
  } catch (error: any) {
    toast.add({ color: 'error', title: error?.data?.message || 'Error al generar perfil' })
  } finally {
    isGeneratingProfile.value = false
  }
}

// Legislators
const { data: legislatorsData, refresh: refreshLegislators } = await useAuthFetch<{ legislators: PoliticalPartyLegislator[] }>(
  `/api/backend/admin/political-parties/${partyId}/legislators`
)

const partyLegislators = computed(() => legislatorsData.value?.legislators || [])

const newLegislator = ref({
  fullName: '',
  chamber: '' as string,
  photoUrl: '',
})

const isAddingLegislator = ref(false)

async function addLegislator() {
  if (!newLegislator.value.fullName.trim()) {
    toast.add({ color: 'error', title: 'El nombre es requerido' })
    return
  }
  isAddingLegislator.value = true
  try {
    await $authFetch(`/api/backend/admin/political-parties/${partyId}/legislators`, {
      method: 'POST',
      body: {
        fullName: newLegislator.value.fullName.trim(),
        chamber: newLegislator.value.chamber || null,
        photoUrl: newLegislator.value.photoUrl.trim() || null,
      },
    })
    toast.add({ color: 'success', title: 'Legislador agregado' })
    newLegislator.value = { fullName: '', chamber: '', photoUrl: '' }
    await refreshLegislators()
  } catch (error: any) {
    toast.add({ color: 'error', title: error?.data?.message || 'Error al agregar legislador' })
  } finally {
    isAddingLegislator.value = false
  }
}

async function removeLegislator(legislator: PoliticalPartyLegislator) {
  const instance = confirmModal.open({
    question: 'Quitar legislador',
    bodyText: `¿Quitar a "${legislator.fullName}" de este partido?`,
    acceptLabel: 'Quitar',
    cancelLabel: 'Cancelar',
  })
  const confirmed = await instance.result
  if (!confirmed) return

  try {
    await $authFetch(`/api/backend/admin/political-parties/${partyId}/legislators/${legislator.id}`, {
      method: 'DELETE',
    })
    toast.add({ color: 'success', title: 'Legislador removido' })
    await refreshLegislators()
  } catch (error: any) {
    toast.add({ color: 'error', title: error?.data?.message || 'Error al remover legislador' })
  }
}

const pageTitle = computed(() => party.value ? `Editar: ${party.value.name}` : 'Editar Partido Político')

const tabs = [
  { label: 'General', value: 'general', icon: 'i-lucide-settings' },
  { label: 'Archivos', value: 'files', icon: 'i-lucide-file-text' },
  { label: 'Perfil IA', value: 'profile', icon: 'i-lucide-brain' },
  { label: 'Legisladores', value: 'legislators', icon: 'i-lucide-users' },
]

const chamberItems = [
  { label: 'Diputados', value: 'deputies' },
  { label: 'Senadores', value: 'senators' },
]

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <UContainer class="py-8 max-w-4xl">
    <UPageHeader
      :title="pageTitle"
      :links="[
        {
          label: 'Volver',
          icon: 'i-lucide-arrow-left',
          to: '/admin/partidos-politicos',
          color: 'neutral' as const,
          variant: 'outline' as const,
        },
      ]"
    />

    <UTabs :items="tabs" class="mt-6">
      <template #general>
        <UPageCard class="mt-4" variant="outline">
          <form class="space-y-6" @submit.prevent="handleUpdate">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Nombre" required>
                <UInput v-model="form.name" placeholder="Nombre del partido" class="w-full" />
              </UFormField>

              <UFormField label="Slug" required>
                <UInput v-model="form.slug" placeholder="slug-del-partido" class="w-full" />
              </UFormField>

              <UFormField label="Sigla">
                <UInput v-model="form.shortName" placeholder="Ej: UCR" class="w-full" />
              </UFormField>

              <UFormField label="Estado">
                <USelectMenu
                  v-model="form.status"
                  :items="[
                    { label: 'Borrador', value: 'draft' },
                    { label: 'Activo', value: 'active' },
                    { label: 'Archivado', value: 'archived' },
                  ]"
                  value-key="value"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField label="URL del Logo">
              <UInput v-model="form.logoUrl" placeholder="https://..." class="w-full" />
            </UFormField>

            <div class="flex justify-end">
              <UButton type="submit" label="Guardar Cambios" :loading="isSubmitting" />
            </div>
          </form>
        </UPageCard>
      </template>

      <template #files>
        <UPageCard class="mt-4" variant="outline">
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium mb-2">Subir archivo</h3>
              <p class="text-sm text-muted mb-4">
                Subí documentos del partido (plataforma electoral, estatuto, discursos, etc.) para que la IA los use al generar el perfil.
              </p>
              <div class="flex items-center gap-3">
                <input
                  ref="fileInput"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  class="text-sm"
                  @change="uploadFile"
                />
                <UButton
                  v-if="isUploading"
                  label="Subiendo..."
                  loading
                  disabled
                />
              </div>
            </div>

            <USeparator />

            <div>
              <h3 class="text-lg font-medium mb-4">Archivos del partido</h3>
              <div v-if="party?.files?.length" class="space-y-2">
                <div
                  v-for="file in party.files"
                  :key="file.id"
                  class="flex items-center justify-between p-3 rounded-lg border border-default"
                >
                  <div class="flex items-center gap-3">
                    <UIcon name="i-lucide-file-text" class="text-lg text-primary" />
                    <div>
                      <p class="text-sm font-medium">{{ file.name }}</p>
                      <p class="text-xs text-muted">{{ formatFileSize(file.size) }} · {{ file.type }}</p>
                    </div>
                  </div>
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="xs"
                    @click="deleteFile(file)"
                  />
                </div>
              </div>
              <p v-else class="text-sm text-muted">No hay archivos cargados.</p>
            </div>
          </div>
        </UPageCard>
      </template>

      <template #profile>
        <UPageCard class="mt-4" variant="outline">
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium mb-2">Perfil del Partido (IA)</h3>
              <p class="text-sm text-muted mb-4">
                La IA generará un perfil ideológico del partido analizando los documentos subidos. Este perfil se usa para predecir votaciones.
              </p>
            </div>

            <UAlert
              v-if="!party?.files?.length"
              color="warning"
              variant="subtle"
              title="Sin archivos"
              description="Subí al menos un documento del partido antes de generar el perfil."
              icon="i-lucide-alert-triangle"
            />

            <div v-if="party?.profileSummary" class="space-y-3">
              <UBadge color="success" variant="subtle">
                Perfil generado · {{ party.profileGeneratedAt ? new Date(party.profileGeneratedAt).toLocaleDateString('es-AR') : '' }}
              </UBadge>
              <div class="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {{ party.profileSummary }}
              </div>
            </div>

            <USeparator />

            <div class="flex items-center gap-4">
              <UCheckbox
                v-model="expandWithSearch"
                label="Ampliar con búsqueda en internet"
              />
              <UButton
                label="Generar Perfil"
                icon="i-lucide-sparkles"
                :loading="isGeneratingProfile"
                :disabled="!party?.files?.length"
                @click="generateProfile"
              />
            </div>
          </div>
        </UPageCard>
      </template>

      <template #legislators>
        <UPageCard class="mt-4" variant="outline">
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium mb-2">Legisladores del partido</h3>
              <p class="text-sm text-muted mb-4">
                Asociá legisladores a este partido político. Estos se mostrarán en el hub público.
              </p>
            </div>

            <!-- Add legislator form -->
            <div class="flex flex-wrap items-end gap-3 p-4 rounded-lg border border-default">
              <UFormField label="Nombre completo" class="flex-1 min-w-50">
                <UInput
                  v-model="newLegislator.fullName"
                  placeholder="Nombre y Apellido"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Cámara">
                <USelectMenu
                  v-model="newLegislator.chamber"
                  :items="chamberItems"
                  value-key="value"
                  placeholder="Cámara"
                  class="w-40"
                  clear
                />
              </UFormField>

              <UButton
                label="Agregar"
                icon="i-lucide-plus"
                :loading="isAddingLegislator"
                @click="addLegislator"
              />
            </div>

            <USeparator />

            <!-- Legislators list -->
            <div v-if="partyLegislators.length" class="space-y-2">
              <div
                v-for="legislator in partyLegislators"
                :key="legislator.id"
                class="flex items-center justify-between p-3 rounded-lg border border-default"
              >
                <div class="flex items-center gap-3">
                  <UAvatar
                    v-if="legislator.photoUrl"
                    :src="legislator.photoUrl"
                    :alt="legislator.fullName"
                    size="sm"
                  />
                  <UIcon v-else name="i-lucide-user" class="text-lg text-muted" />
                  <div>
                    <p class="text-sm font-medium">{{ legislator.fullName }}</p>
                    <p v-if="legislator.chamber" class="text-xs text-muted">
                      {{ legislator.chamber === 'deputies' ? 'Diputado/a' : 'Senador/a' }}
                    </p>
                  </div>
                </div>
                <UButton
                  icon="i-lucide-x"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="removeLegislator(legislator)"
                />
              </div>
            </div>
            <p v-else class="text-sm text-muted">No hay legisladores asociados a este partido.</p>
          </div>
        </UPageCard>
      </template>
    </UTabs>
  </UContainer>
</template>

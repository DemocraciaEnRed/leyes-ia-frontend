<script setup lang="ts">
import type { PoliticalParty, PoliticalPartyFile, PoliticalPartyLegislator } from '~/shared/types/politicalParty'
import ConfirmActionModal from '~/components/ConfirmActionModal.vue'

definePageMeta({
  layout: 'panel-admin',
  middleware: 'admin'
})

const route = useRoute()
const toast = useToast()
const overlay = useOverlay()
const confirmModal = overlay.create(ConfirmActionModal)
const partyId = route.params.id as string

// --- Fetch party data ---
const { data, pending, refresh } = await useAuthFetch<{ party: PoliticalParty }>(
  `/api/backend/admin/political-parties/${partyId}`
)

const party = computed(() => data.value?.party || null)

// --- Edit form ---
const isEditing = ref(false)
const isSaving = ref(false)
const editForm = ref({
  name: '',
  slug: '',
  shortName: '',
  status: 'draft',
})

function startEditing() {
  if (!party.value) return
  editForm.value = {
    name: party.value.name,
    slug: party.value.slug,
    shortName: party.value.shortName || '',
    status: party.value.status,
  }
  isEditing.value = true
}

async function saveEdit() {
  isSaving.value = true
  try {
    await $authFetch(`/api/backend/admin/political-parties/${partyId}`, {
      method: 'PATCH',
      body: {
        name: editForm.value.name.trim(),
        slug: editForm.value.slug.trim(),
        shortName: editForm.value.shortName.trim() || null,
        status: editForm.value.status,
      },
    })
    toast.add({ color: 'success', title: 'Partido actualizado' })
    isEditing.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ color: 'error', title: error?.data?.message || 'Error al actualizar' })
  } finally {
    isSaving.value = false
  }
}

// --- File upload ---
const isUploading = ref(false)
const fileType = ref('platform')
const fileTypeItems = [
  { label: 'Plataforma electoral', value: 'platform' },
  { label: 'Discurso', value: 'speech' },
  { label: 'Documento', value: 'document' },
  { label: 'Otro', value: 'other' },
]

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('partyFile', file)
    formData.append('fileType', fileType.value)

    await $authFetch(`/api/backend/admin/political-parties/${partyId}/files`, {
      method: 'POST',
      body: formData,
    })
    toast.add({ color: 'success', title: 'Archivo subido exitosamente' })
    await refresh()
  } catch (error: any) {
    toast.add({ color: 'error', title: error?.data?.message || 'Error al subir archivo' })
  } finally {
    isUploading.value = false
    input.value = ''
  }
}

async function deleteFile(file: PoliticalPartyFile) {
  const instance = confirmModal.open({
    question: 'Eliminar archivo',
    bodyText: `¿Estás seguro de que querés eliminar "${file.name}"?`,
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
  } catch {
    toast.add({ color: 'error', title: 'Error al eliminar archivo' })
  }
}

// --- Profile generation ---
const isGenerating = ref(false)
const expandWithSearch = ref(false)

async function generateProfile() {
  isGenerating.value = true
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
    isGenerating.value = false
  }
}

// --- Legislator management ---
const showAddLegislator = ref(false)
const isAddingLegislator = ref(false)
const newLegislator = ref({
  fullName: '',
  chamber: '' as '' | 'deputies' | 'senators',
  provinceId: undefined as number | undefined,
})

const { data: provincesData } = await useAuthFetch<{ provinces: Array<{ id: number; name: string }> }>(
  '/api/backend/utils/provinces'
)
const provinceItems = computed(() =>
  (provincesData.value?.provinces || []).map(p => ({ label: p.name, value: p.id }))
)

const chamberItems = [
  { label: 'Diputado/a', value: 'deputies' },
  { label: 'Senador/a', value: 'senators' },
]

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
        provinceId: newLegislator.value.provinceId || null,
      },
    })
    toast.add({ color: 'success', title: 'Legislador agregado' })
    newLegislator.value = { fullName: '', chamber: '', provinceId: undefined }
    showAddLegislator.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ color: 'error', title: error?.data?.message || 'Error al agregar legislador' })
  } finally {
    isAddingLegislator.value = false
  }
}

async function removeLegislator(legislator: PoliticalPartyLegislator) {
  const instance = confirmModal.open({
    question: 'Eliminar legislador',
    bodyText: `¿Eliminar a "${legislator.fullName}" de este partido?`,
    acceptLabel: 'Eliminar',
    cancelLabel: 'Cancelar',
  })

  const confirmed = await instance.result
  if (!confirmed) return

  try {
    await $authFetch(`/api/backend/admin/political-parties/${partyId}/legislators/${legislator.id}`, {
      method: 'DELETE',
    })
    toast.add({ color: 'success', title: 'Legislador eliminado' })
    await refresh()
  } catch {
    toast.add({ color: 'error', title: 'Error al eliminar legislador' })
  }
}

// --- Status display ---
const statusConfig: Record<string, { label: string; color: 'warning' | 'success' | 'neutral' }> = {
  draft: { label: 'Borrador', color: 'warning' },
  active: { label: 'Activo', color: 'success' },
  archived: { label: 'Archivado', color: 'neutral' },
}

const fileTypeConfig: Record<string, string> = {
  platform: 'Plataforma',
  speech: 'Discurso',
  document: 'Documento',
  other: 'Otro',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-AR', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <UContainer class="py-8 max-w-4xl">
    <UProgress v-if="pending" indeterminate class="my-8" />

    <template v-else-if="party">
      <UPageHeader
        :title="party.name"
        :description="party.shortName ? `${party.shortName} · ${party.slug}` : party.slug"
        :links="[
          {
            label: 'Volver',
            icon: 'i-lucide-arrow-left',
            to: '/admin/partidos-politicos',
            color: 'neutral' as const,
            variant: 'outline' as const,
          },
        ]"
      >
        <template #headline>
          <UBadge :color="statusConfig[party.status]?.color || 'neutral'" variant="subtle">
            {{ statusConfig[party.status]?.label || party.status }}
          </UBadge>
        </template>
      </UPageHeader>

      <div class="mt-8 space-y-8">
        <!-- Basic Info -->
        <UPageCard title="Información básica" icon="i-lucide-info" variant="outline">
          <template #trailing>
            <UButton
              v-if="!isEditing"
              label="Editar"
              icon="i-lucide-pencil"
              color="neutral"
              variant="outline"
              size="sm"
              @click="startEditing"
            />
          </template>

          <div v-if="!isEditing" class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-muted mb-1">Nombre</p>
              <p class="font-medium">{{ party.name }}</p>
            </div>
            <div>
              <p class="text-muted mb-1">Sigla</p>
              <p class="font-medium">{{ party.shortName || '—' }}</p>
            </div>
            <div>
              <p class="text-muted mb-1">Slug</p>
              <p class="font-medium font-mono text-xs">{{ party.slug }}</p>
            </div>
            <div>
              <p class="text-muted mb-1">Estado</p>
              <UBadge :color="statusConfig[party.status]?.color || 'neutral'" variant="subtle" size="sm">
                {{ statusConfig[party.status]?.label || party.status }}
              </UBadge>
            </div>
          </div>

          <form v-else class="space-y-4" @submit.prevent="saveEdit">
            <UFormField label="Nombre" required>
              <UInput v-model="editForm.name" class="w-full" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Slug" required>
                <UInput v-model="editForm.slug" class="w-full" />
              </UFormField>
              <UFormField label="Sigla">
                <UInput v-model="editForm.shortName" class="w-full" />
              </UFormField>
            </div>
            <UFormField label="Estado">
              <USelectMenu
                v-model="editForm.status"
                :items="[
                  { label: 'Borrador', value: 'draft' },
                  { label: 'Activo', value: 'active' },
                  { label: 'Archivado', value: 'archived' },
                ]"
                value-key="value"
                class="w-48"
              />
            </UFormField>
            <div class="flex gap-3 pt-2">
              <UButton type="submit" label="Guardar" :loading="isSaving" />
              <UButton label="Cancelar" color="neutral" variant="outline" @click="isEditing = false" />
            </div>
          </form>
        </UPageCard>

        <!-- Files -->
        <UPageCard title="Archivos" description="Documentos del partido (plataforma electoral, discursos, etc.)" icon="i-lucide-files" variant="outline">
          <div class="space-y-4">
            <!-- File list -->
            <div v-if="party.files && party.files.length > 0" class="space-y-2">
              <div
                v-for="file in party.files"
                :key="file.id"
                class="flex items-center justify-between gap-3 p-3 rounded-lg border border-default bg-elevated"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <UIcon name="i-lucide-file-text" class="size-5 text-primary shrink-0" />
                  <div class="min-w-0">
                    <p class="text-sm font-medium truncate">{{ file.name }}</p>
                    <div class="flex items-center gap-2 text-xs text-muted">
                      <UBadge variant="subtle" color="neutral" size="xs">{{ fileTypeConfig[file.type] || file.type }}</UBadge>
                      <span>{{ formatBytes(file.size) }}</span>
                      <span>{{ formatDate(file.createdAt) }}</span>
                    </div>
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

            <div v-else class="py-6 text-center text-sm text-muted">
              <UIcon name="i-lucide-upload-cloud" class="size-8 mb-2 mx-auto" />
              <p>No hay archivos cargados</p>
            </div>

            <!-- Upload form -->
            <USeparator />
            <div class="flex items-end gap-3">
              <UFormField label="Tipo de archivo" class="w-48">
                <USelectMenu
                  v-model="fileType"
                  :items="fileTypeItems"
                  value-key="value"
                  :search-input="false"
                />
              </UFormField>
              <div>
                <label class="cursor-pointer">
                  <UButton
                    as="span"
                    label="Subir archivo"
                    icon="i-lucide-upload"
                    color="neutral"
                    variant="outline"
                    :loading="isUploading"
                  />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    class="hidden"
                    :disabled="isUploading"
                    @change="handleFileUpload"
                  />
                </label>
              </div>
            </div>
          </div>
        </UPageCard>

        <!-- AI Profile -->
        <UPageCard
          title="Perfil ideológico (IA)"
          description="Perfil generado por inteligencia artificial a partir de los documentos cargados"
          icon="i-lucide-brain"
          variant="outline"
        >
          <div class="space-y-4">
            <div v-if="party.profileSummary" class="space-y-3">
              <div class="flex items-center gap-2 text-xs text-muted">
                <UBadge variant="subtle" :color="party.profileExpandedWithSearch ? 'info' : 'neutral'" size="xs">
                  {{ party.profileExpandedWithSearch ? 'Con búsqueda web' : 'Solo documentos' }}
                </UBadge>
                <span v-if="party.profileGeneratedAt">
                  Generado: {{ formatDate(party.profileGeneratedAt) }}
                </span>
              </div>
              <div class="prose prose-sm max-w-none p-4 rounded-lg bg-elevated border border-default">
                <MDC :value="party.profileSummary" />
              </div>
            </div>

            <UAlert
              v-else
              icon="i-lucide-info"
              color="info"
              variant="subtle"
              title="Perfil no generado"
              description="Cargá al menos un documento del partido y hacé clic en 'Generar perfil' para crear el perfil ideológico."
            />

            <USeparator />

            <div class="flex items-center justify-between gap-4 flex-wrap">
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <UCheckbox v-model="expandWithSearch" />
                <span class="text-muted">Ampliar con búsqueda web</span>
              </label>
              <UButton
                icon="i-lucide-sparkles"
                :label="party.profileSummary ? 'Regenerar perfil' : 'Generar perfil'"
                :loading="isGenerating"
                :disabled="!party.files || party.files.length === 0"
                @click="generateProfile"
              />
            </div>
          </div>
        </UPageCard>

        <!-- Party Legislators -->
        <UPageCard title="Legisladores del partido" description="Miembros del bloque legislativo" icon="i-lucide-users" variant="outline">
          <div class="space-y-4">
            <div v-if="party.partyLegislators && party.partyLegislators.length > 0" class="space-y-2">
              <div
                v-for="leg in party.partyLegislators"
                :key="leg.id"
                class="flex items-center justify-between gap-3 p-3 rounded-lg border border-default bg-elevated"
              >
                <div class="flex items-center gap-3">
                  <UAvatar :alt="leg.fullName" :src="leg.photoUrl || undefined" size="sm" />
                  <div>
                    <p class="text-sm font-medium">{{ leg.fullName }}</p>
                    <div class="flex items-center gap-2 text-xs text-muted">
                      <UBadge v-if="leg.chamber" variant="subtle" :color="leg.chamber === 'deputies' ? 'info' : 'primary'" size="xs">
                        {{ leg.chamber === 'deputies' ? 'Diputado/a' : 'Senador/a' }}
                      </UBadge>
                      <span v-if="leg.province">{{ leg.province.name }}</span>
                      <UBadge v-if="leg.status === 'inactive'" variant="subtle" color="neutral" size="xs">Inactivo</UBadge>
                    </div>
                  </div>
                </div>
                <UButton
                  icon="i-lucide-x"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="removeLegislator(leg)"
                />
              </div>
            </div>

            <div v-else class="py-6 text-center text-sm text-muted">
              <UIcon name="i-lucide-users" class="size-8 mb-2 mx-auto" />
              <p>No hay legisladores en este partido</p>
            </div>

            <!-- Add legislator form -->
            <USeparator />
            <div v-if="!showAddLegislator">
              <UButton
                label="Agregar legislador"
                icon="i-lucide-plus"
                color="neutral"
                variant="outline"
                @click="showAddLegislator = true"
              />
            </div>
            <div v-else class="space-y-3 p-4 rounded-lg border border-default bg-elevated">
              <UFormField label="Nombre completo" required>
                <UInput v-model="newLegislator.fullName" placeholder="Ej: Juan Pérez" class="w-full" />
              </UFormField>
              <div class="grid grid-cols-2 gap-3">
                <UFormField label="Cámara">
                  <USelectMenu
                    v-model="newLegislator.chamber"
                    :items="chamberItems"
                    value-key="value"
                    placeholder="Seleccionar..."
                    class="w-full"
                    :search-input="false"
                    clear
                  />
                </UFormField>
                <UFormField label="Provincia">
                  <USelectMenu
                    v-model="newLegislator.provinceId"
                    :items="provinceItems"
                    value-key="value"
                    placeholder="Seleccionar..."
                    class="w-full"
                    clear
                  />
                </UFormField>
              </div>
              <div class="flex gap-3 pt-1">
                <UButton label="Agregar" icon="i-lucide-plus" :loading="isAddingLegislator" @click="addLegislator" />
                <UButton label="Cancelar" color="neutral" variant="outline" @click="showAddLegislator = false" />
              </div>
            </div>
          </div>
        </UPageCard>
      </div>
    </template>

    <UAlert
      v-else
      color="error"
      variant="subtle"
      icon="i-lucide-alert-circle"
      title="Partido no encontrado"
      description="No se pudo encontrar el partido político solicitado."
    />
  </UContainer>
</template>

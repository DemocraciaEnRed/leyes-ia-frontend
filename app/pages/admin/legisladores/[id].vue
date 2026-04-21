<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { LegislatorDetailResponse } from '~/shared/types/legislator'

definePageMeta({
  layout: 'panel-admin',
  middleware: 'admin'
})

const toast = useToast()
const route = useRoute()
const legislatorId = route.params.id
const isSubmitting = ref(false)

// Zod schema
const schema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  chamber: z.enum(['deputies', 'senators'], { message: 'Seleccioná una cámara' }),
  provinceId: z.number().int().min(1).optional().nullable(),
  externalId: z.string().optional(),
  externalSource: z.enum(['hcdn', 'senado', 'other']).optional().nullable(),
  blockName: z.string().optional(),
  termStart: z.string().optional(),
  termEnd: z.string().optional(),
  photoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  active: z.boolean(),
  metadata: z.string().optional(),
}).refine(data => {
  if (data.externalId && !data.externalSource) return false
  if (!data.externalId && data.externalSource) return false
  return true
}, {
  message: 'Si se envía ID Externo, la Fuente Externa es requerida (y viceversa)',
  path: ['externalSource'],
}).refine(data => {
  if (data.termStart && data.termEnd && data.termStart >= data.termEnd) return false
  return true
}, {
  message: 'La fecha de inicio debe ser anterior a la de fin',
  path: ['termEnd'],
})

type Schema = z.output<typeof schema>

const formState = reactive({
  firstName: '',
  lastName: '',
  chamber: undefined as 'deputies' | 'senators' | undefined,
  provinceId: undefined as number | undefined,
  externalId: '',
  externalSource: undefined as 'hcdn' | 'senado' | 'other' | undefined,
  blockName: '',
  termStart: '',
  termEnd: '',
  photoUrl: '',
  email: '',
  active: true,
  metadata: '',
})

// Fetch legislator
const { data: legislatorData, error: fetchError } = await useAuthFetch<LegislatorDetailResponse>(
  `/api/backend/admin/legislators/${legislatorId}`
)

// Populate form from fetched data
watch(legislatorData, (response) => {
  if (!response?.legislator) return
  const l = response.legislator
  formState.firstName = l.firstName
  formState.lastName = l.lastName
  formState.chamber = l.chamber
  formState.provinceId = l.provinceId ?? undefined
  formState.externalId = l.externalId || ''
  formState.externalSource = l.externalSource ?? undefined
  formState.blockName = l.blockName || ''
  formState.termStart = l.termStart || ''
  formState.termEnd = l.termEnd || ''
  formState.photoUrl = l.photoUrl || ''
  formState.email = l.email || ''
  formState.active = l.active
  formState.metadata = l.metadata ? JSON.stringify(l.metadata, null, 2) : ''
}, { immediate: true })

// Fetch provinces
const { data: provincesData } = await useAuthFetch<{ provinces: Array<{ id: number, name: string }> }>(
  '/api/backend/utils/provinces'
)
const provinceItems = computed(() =>
  (provincesData.value?.provinces || []).map(p => ({ label: p.name, value: p.id }))
)

const chamberItems = [
  { label: 'Diputados', value: 'deputies' },
  { label: 'Senadores', value: 'senators' },
]

const externalSourceItems = [
  { label: 'HCDN', value: 'hcdn' },
  { label: 'Senado', value: 'senado' },
  { label: 'Otro', value: 'other' },
]

const pageTitle = computed(() => {
  if (legislatorData.value?.legislator) {
    return `Editar: ${legislatorData.value.legislator.fullName}`
  }
  return 'Editar Legislador'
})

const handleSubmit = async (event: FormSubmitEvent<Schema>) => {
  isSubmitting.value = true
  try {
    // Parse metadata JSON if provided
    let metadata = null
    if (formState.metadata.trim()) {
      try {
        metadata = JSON.parse(formState.metadata)
      } catch {
        toast.add({ color: 'error', title: 'El campo Metadata debe ser JSON válido' })
        isSubmitting.value = false
        return
      }
    }

    const body: Record<string, unknown> = {
      firstName: formState.firstName,
      lastName: formState.lastName,
      chamber: formState.chamber,
      active: formState.active,
      provinceId: formState.provinceId || null,
      externalId: formState.externalId || null,
      externalSource: formState.externalSource || null,
      blockName: formState.blockName || null,
      termStart: formState.termStart || null,
      termEnd: formState.termEnd || null,
      photoUrl: formState.photoUrl || null,
      email: formState.email || null,
      metadata,
    }

    await $authFetch(`/api/backend/admin/legislators/${legislatorId}`, {
      method: 'PUT',
      body,
    })

    toast.add({ color: 'success', title: 'Legislador actualizado exitosamente' })
    await navigateTo('/admin/legisladores')
  } catch (error: any) {
    const message = error?.data?.message || 'Error al actualizar legislador'
    toast.add({ color: 'error', title: message })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-3xl">
    <UPageHeader
      :title="pageTitle"
      :links="[
        {
          label: 'Volver',
          icon: 'i-lucide-arrow-left',
          to: '/admin/legisladores',
          color: 'neutral' as const,
          variant: 'ghost' as const,
        },
      ]"
    />

    <UAlert
      v-if="fetchError"
      color="error"
      variant="subtle"
      title="Error al cargar legislador"
      :description="fetchError.statusCode === 404 ? 'El legislador no fue encontrado.' : 'Ocurrió un error al cargar los datos.'"
      class="mt-6"
    />

    <UForm
      v-else
      :schema="schema"
      :state="formState"
      class="mt-6"
      @submit="handleSubmit"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Nombre" name="firstName" required>
          <UInput v-model="formState.firstName" placeholder="Juan" class="w-full" />
        </UFormField>

        <UFormField label="Apellido" name="lastName" required>
          <UInput v-model="formState.lastName" placeholder="Pérez" class="w-full" />
        </UFormField>

        <UFormField label="Cámara" name="chamber" required>
          <USelectMenu
            v-model="formState.chamber"
            :items="chamberItems"
            value-key="value"
            placeholder="Seleccionar cámara"
            class="w-full"
            :search-input="false"
          />
        </UFormField>

        <UFormField label="Provincia" name="provinceId">
          <USelectMenu
            v-model="formState.provinceId"
            :items="provinceItems"
            value-key="value"
            placeholder="Seleccionar provincia"
            class="w-full"
            clear
          />
        </UFormField>

        <UFormField label="Bloque" name="blockName">
          <UInput v-model="formState.blockName" placeholder="Nombre del bloque" class="w-full" />
        </UFormField>

        <UFormField label="Email" name="email">
          <UInput v-model="formState.email" type="email" placeholder="legislador@email.com" class="w-full" />
        </UFormField>

        <UFormField label="ID Externo" name="externalId">
          <UInput v-model="formState.externalId" placeholder="Ej: 4521" class="w-full" />
        </UFormField>

        <UFormField label="Fuente Externa" name="externalSource">
          <USelectMenu
            v-model="formState.externalSource"
            :items="externalSourceItems"
            value-key="value"
            placeholder="Seleccionar fuente"
            class="w-full"
            :search-input="false"
            clear
          />
        </UFormField>

        <UFormField label="Inicio Mandato" name="termStart">
          <UInput v-model="formState.termStart" type="date" class="w-full" />
        </UFormField>

        <UFormField label="Fin Mandato" name="termEnd">
          <UInput v-model="formState.termEnd" type="date" class="w-full" />
        </UFormField>

        <UFormField label="URL Foto" name="photoUrl" class="md:col-span-2">
          <UInput v-model="formState.photoUrl" type="url" placeholder="https://..." class="w-full" />
        </UFormField>

        <UFormField label="Activo" name="active" class="md:col-span-2">
          <USwitch
            v-model="formState.active"
            label="Activo"
            description="Indica si el legislador está actualmente en funciones"
          />
        </UFormField>

        <UFormField label="Metadata (JSON)" name="metadata" class="md:col-span-2">
          <UTextarea
            v-model="formState.metadata"
            autoresize
            :rows="3"
            placeholder='{"twitter": "@handle", "comisiones": ["Educación"]}'
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          to="/admin/legisladores"
        >
          Cancelar
        </UButton>
        <UButton
          type="submit"
          color="primary"
          :loading="isSubmitting"
          icon="i-lucide-save"
        >
          Guardar Cambios
        </UButton>
      </div>
    </UForm>
  </UContainer>
</template>

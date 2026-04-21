<script setup lang="ts">
definePageMeta({
  layout: 'panel-admin',
  middleware: 'admin'
})

const toast = useToast()
const router = useRouter()

const form = ref({
  name: '',
  slug: '',
  shortName: '',
  status: 'draft',
})

const isSubmitting = ref(false)

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

watch(() => form.value.name, (name) => {
  form.value.slug = slugify(name)
})

async function handleSubmit() {
  if (!form.value.name.trim() || !form.value.slug.trim()) {
    toast.add({ color: 'error', title: 'El nombre y slug son requeridos' })
    return
  }

  isSubmitting.value = true
  try {
    const result = await $authFetch<{ party: { id: number } }>('/api/backend/admin/political-parties', {
      method: 'POST',
      body: {
        name: form.value.name.trim(),
        slug: form.value.slug.trim(),
        shortName: form.value.shortName.trim() || null,
        status: form.value.status,
      },
    })
    toast.add({ color: 'success', title: 'Partido creado exitosamente' })
    router.push(`/admin/partidos-politicos/${result.party.id}`)
  } catch (error: any) {
    const message = error?.data?.message || 'Error al crear partido'
    toast.add({ color: 'error', title: message })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <UPageHeader
      title="Nuevo Partido Político"
      description="Crear un nuevo partido político para el sistema de predicción de votaciones"
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

    <UPageCard class="mt-8" variant="outline">
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <UFormField label="Nombre" required>
          <UInput
            v-model="form.name"
            placeholder="Ej: Unión Cívica Radical"
            icon="i-lucide-flag"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Slug" required help="Se genera automáticamente a partir del nombre">
          <UInput
            v-model="form.slug"
            placeholder="Ej: union-civica-radical"
            icon="i-lucide-link"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Sigla (opcional)">
          <UInput
            v-model="form.shortName"
            placeholder="Ej: UCR"
            icon="i-lucide-type"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Estado">
          <USelectMenu
            v-model="form.status"
            :items="[
              { label: 'Borrador', value: 'draft' },
              { label: 'Activo', value: 'active' },
            ]"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-3 pt-4">
          <UButton
            label="Cancelar"
            color="neutral"
            variant="outline"
            to="/admin/partidos-politicos"
          />
          <UButton
            type="submit"
            label="Crear Partido"
            icon="i-lucide-plus"
            :loading="isSubmitting"
          />
        </div>
      </form>
    </UPageCard>
  </UContainer>
</template>

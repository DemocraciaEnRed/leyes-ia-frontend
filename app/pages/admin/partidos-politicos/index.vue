<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { DropdownMenuItem } from '@nuxt/ui'
import type { PoliticalPartyListResponse, PoliticalParty } from '~/shared/types/politicalParty'
import ConfirmActionModal from '~/components/ConfirmActionModal.vue'

definePageMeta({
  layout: 'panel-admin',
  middleware: 'admin'
})

const overlay = useOverlay()
const confirmModal = overlay.create(ConfirmActionModal)
const toast = useToast()

// Filters
const search = ref('')
const debouncedSearch = refDebounced(search, 400)
const status = ref('')
const page = ref(1)
const limit = 20

const queryParams = computed(() => {
  const params: Record<string, string | number> = { page: page.value, limit }
  if (debouncedSearch.value) params.search = debouncedSearch.value
  if (status.value) params.status = status.value
  return params
})

watch([debouncedSearch, status], () => { page.value = 1 })

const { data, pending, refresh } = await useAuthFetch<PoliticalPartyListResponse>(
  '/api/backend/admin/political-parties',
  { query: queryParams }
)

const parties = computed(() => data.value?.parties || [])
const pagination = computed(() => data.value?.pagination || { page: 1, limit, total: 0, totalPages: 0 })

const statusItems = [
  { label: 'Borrador', value: 'draft' },
  { label: 'Activo', value: 'active' },
  { label: 'Archivado', value: 'archived' },
]

const statusConfig: Record<string, { label: string; color: 'warning' | 'success' | 'neutral' }> = {
  draft: { label: 'Borrador', color: 'warning' },
  active: { label: 'Activo', color: 'success' },
  archived: { label: 'Archivado', color: 'neutral' },
}

const UBadge = resolveComponent('UBadge')

const columns = [
  {
    accessorKey: 'name',
    header: 'Nombre',
  },
  {
    accessorKey: 'shortName',
    header: 'Sigla',
    cell: ({ row }: { row: { original: PoliticalParty } }) => row.original.shortName || '—',
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }: { row: { original: PoliticalParty } }) => {
      const cfg = statusConfig[row.original.status]
      return h(UBadge, { color: cfg?.color || 'neutral', variant: 'subtle' }, () => cfg?.label || row.original.status)
    },
  },
  {
    accessorKey: 'profileSummary',
    header: 'Perfil IA',
    cell: ({ row }: { row: { original: PoliticalParty } }) => {
      const hasProfile = !!row.original.profileSummary
      return h(UBadge, {
        color: hasProfile ? 'success' : 'neutral',
        variant: 'subtle',
      }, () => hasProfile ? 'Generado' : 'Pendiente')
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
  },
]

function getRowActions(party: PoliticalParty): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        to: `/admin/partidos-politicos/${party.id}`,
      },
    ],
    [
      {
        label: party.status === 'archived' ? 'Activar' : 'Archivar',
        icon: party.status === 'archived' ? 'i-lucide-archive-restore' : 'i-lucide-archive',
        onSelect: () => party.status === 'archived' ? activateParty(party) : archiveParty(party),
      },
    ],
  ]
}

async function activateParty(party: PoliticalParty) {
  try {
    await $authFetch(`/api/backend/admin/political-parties/${party.id}`, {
      method: 'PATCH',
      body: { status: 'active' },
    })
    toast.add({ color: 'success', title: 'Partido activado' })
    await refresh()
  } catch {
    toast.add({ color: 'error', title: 'Error al activar partido' })
  }
}

async function archiveParty(party: PoliticalParty) {
  const instance = confirmModal.open({
    question: 'Archivar partido político',
    bodyText: `¿Estás seguro de que querés archivar "${party.name}"?`,
    acceptLabel: 'Archivar',
    cancelLabel: 'Cancelar',
  })

  const confirmed = await instance.result
  if (!confirmed) return

  try {
    await $authFetch(`/api/backend/admin/political-parties/${party.id}`, {
      method: 'DELETE',
    })
    toast.add({ color: 'success', title: 'Partido archivado' })
    await refresh()
  } catch {
    toast.add({ color: 'error', title: 'Error al archivar partido' })
  }
}
</script>

<template>
  <UContainer class="py-8">
    <UPageHeader
      title="Partidos Políticos"
      description="Gestión de partidos políticos y perfiles para predicción de votaciones"
      :links="[
        {
          label: 'Nuevo Partido',
          icon: 'i-lucide-plus',
          to: '/admin/partidos-politicos/nuevo',
          color: 'primary' as const,
        },
      ]"
    />

    <!-- Filters -->
    <div class="mt-6 flex flex-wrap gap-3">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por nombre..."
        class="w-64"
      />

      <USelectMenu
        v-model="status"
        :items="statusItems"
        value-key="value"
        placeholder="Estado"
        class="w-44"
        :search-input="false"
        clear
      />
    </div>

    <!-- Table -->
    <div class="mt-6">
      <UTable
        :data="parties"
        :columns="columns"
        :loading="pending"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <UIcon name="i-lucide-flag" class="text-4xl text-muted mb-2" />
            <p class="text-sm text-muted">No se encontraron partidos políticos</p>
          </div>
        </template>

        <template #actions-cell="{ row }">
          <UDropdownMenu :items="getRowActions(row.original)">
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              size="xs"
            />
          </UDropdownMenu>
        </template>
      </UTable>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="mt-4 flex justify-center">
      <UPagination
        v-model:page="page"
        :total="pagination.total"
        :items-per-page="limit"
        show-edges
      />
    </div>
  </UContainer>
</template>

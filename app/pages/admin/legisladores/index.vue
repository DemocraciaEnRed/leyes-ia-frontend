<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { DropdownMenuItem } from '@nuxt/ui'
import type { LegislatorListResponse, Legislator } from '~/shared/types/legislator'
import ConfirmActionModal from '~/components/ConfirmActionModal.vue'

definePageMeta({
  layout: 'default',
  middleware: 'admin'
})

const overlay = useOverlay()
const confirmModal = overlay.create(ConfirmActionModal)
const toast = useToast()

// Filters
const search = ref('')
const debouncedSearch = refDebounced(search, 400)
const chamber = ref('')
const active = ref('')
const provinceId = ref<number | undefined>(undefined)
const page = ref(1)
const limit = 20

// Computed query params
const queryParams = computed(() => {
  const params: Record<string, string | number> = {
    page: page.value,
    limit,
  }
  if (debouncedSearch.value) params.search = debouncedSearch.value
  if (chamber.value) params.chamber = chamber.value
  if (active.value !== '') params.active = active.value
  if (provinceId.value) params.provinceId = provinceId.value
  return params
})

// Reset page when filters change
watch([debouncedSearch, chamber, active, provinceId], () => {
  page.value = 1
})

// Fetch legislators
const { data, pending, refresh } = await useAuthFetch<LegislatorListResponse>(
  '/api/backend/admin/legislators',
  { query: queryParams }
)

const legislators = computed(() => data.value?.legislators || [])
const pagination = computed(() => data.value?.pagination || { page: 1, limit, total: 0, totalPages: 0 })

// Fetch provinces for filter
const { data: provincesData } = await useAuthFetch<{ provinces: Array<{ id: number, name: string }> }>(
  '/api/backend/utils/provinces'
)
const provinceItems = computed(() =>
  (provincesData.value?.provinces || []).map(p => ({ label: p.name, value: p.id }))
)

// Filter options
const chamberItems = [
  { label: 'Diputados', value: 'deputies' },
  { label: 'Senadores', value: 'senators' },
]

const activeItems = [
  { label: 'Activos', value: 'true' },
  { label: 'Inactivos', value: 'false' },
]

// Table columns
const UBadge = resolveComponent('UBadge')

const columns = [
  {
    accessorKey: 'fullName',
    header: 'Nombre',
  },
  {
    accessorKey: 'chamber',
    header: 'Cámara',
    cell: ({ row }: { row: { original: Legislator } }) => {
      const val = row.original.chamber
      return h(UBadge, {
        color: val === 'deputies' ? 'info' : 'primary',
        variant: 'subtle',
      }, () => val === 'deputies' ? 'Diputado/a' : 'Senador/a')
    },
  },
  {
    accessorKey: 'province',
    header: 'Provincia',
    cell: ({ row }: { row: { original: Legislator } }) => {
      return row.original.province?.name || '—'
    },
  },
  {
    accessorKey: 'blockName',
    header: 'Bloque',
    cell: ({ row }: { row: { original: Legislator } }) => {
      return row.original.blockName || '—'
    },
  },
  {
    accessorKey: 'active',
    header: 'Estado',
    cell: ({ row }: { row: { original: Legislator } }) => {
      const isActive = row.original.active
      return h(UBadge, {
        color: isActive ? 'success' : 'neutral',
        variant: 'subtle',
      }, () => isActive ? 'Activo' : 'Inactivo')
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
  },
]

// Row actions
function getRowActions(legislator: Legislator): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Editar',
        icon: 'i-lucide-pencil',
        to: `/admin/legisladores/${legislator.id}`,
      },
    ],
    [
      {
        label: legislator.active ? 'Desactivar' : 'Activar',
        icon: legislator.active ? 'i-lucide-toggle-left' : 'i-lucide-toggle-right',
        onSelect: () => toggleActive(legislator),
      },
    ],
    [
      {
        label: 'Eliminar',
        icon: 'i-lucide-trash-2',
        color: 'error' as const,
        onSelect: () => handleDelete(legislator),
      },
    ],
  ]
}

async function toggleActive(legislator: Legislator) {
  const action = legislator.active ? 'deactivate' : 'activate'
  const label = legislator.active ? 'desactivar' : 'activar'

  try {
    await $authFetch(`/api/backend/admin/legislators/${legislator.id}/${action}`, {
      method: 'PATCH',
    })
    toast.add({ color: 'success', title: `Legislador ${label === 'desactivar' ? 'desactivado' : 'activado'}` })
    await refresh()
  } catch {
    toast.add({ color: 'error', title: `Error al ${label} legislador` })
  }
}

async function handleDelete(legislator: Legislator) {
  const instance = confirmModal.open({
    question: 'Eliminar legislador',
    bodyText: `¿Estás seguro de que querés eliminar a ${legislator.fullName}? Esta acción no se puede deshacer.`,
    acceptLabel: 'Eliminar',
    cancelLabel: 'Cancelar',
  })

  const confirmed = await instance.result
  if (!confirmed) return

  try {
    await $authFetch(`/api/backend/admin/legislators/${legislator.id}`, {
      method: 'DELETE',
    })
    toast.add({ color: 'success', title: 'Legislador eliminado' })
    await refresh()
  } catch (error: any) {
    const message = error?.data?.message || 'Error al eliminar legislador'
    toast.add({ color: 'error', title: message })
  }
}
</script>

<template>
  <UContainer class="py-8">
    <UPageHeader
      title="Legisladores"
      description="Gestión de legisladores argentinos"
      :links="[
        {
          label: 'Nuevo Legislador',
          icon: 'i-lucide-plus',
          to: '/admin/legisladores/nuevo',
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
        v-model="chamber"
        :items="chamberItems"
        value-key="value"
        placeholder="Cámara"
        class="w-44"
        :search-input="false"
        clear
      />

      <USelectMenu
        v-model="active"
        :items="activeItems"
        value-key="value"
        placeholder="Estado"
        class="w-40"
        :search-input="false"
        clear
      />

      <USelectMenu
        v-model="provinceId"
        :items="provinceItems"
        value-key="value"
        placeholder="Provincia"
        class="w-52"
        clear
      />
    </div>

    <!-- Table -->
    <div class="mt-6">
      <UTable
        :data="legislators"
        :columns="columns"
        :loading="pending"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <UIcon name="i-lucide-users" class="text-4xl text-muted mb-2" />
            <p class="text-sm text-muted">No se encontraron legisladores</p>
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

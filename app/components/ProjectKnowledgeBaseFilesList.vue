<script setup>
const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true
  }
})

const isLoading = ref(true)
const files = ref([])
const errorMessage = ref('')

const columns = [
  { accessorKey: 'name', header: 'Archivo' },
  { accessorKey: 'size', header: 'Tamaño' },
  { accessorKey: 'lastModified', header: 'Última modificación' },
  { id: 'actions', header: 'Acciones' }
]

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  const numeric = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(numeric)) return '—'
  return new Intl.NumberFormat('es-AR').format(numeric)
}

const formatFileSize = (value) => {
  const numeric = typeof value === 'string' ? Number(value) : value
  if (!numeric || Number.isNaN(numeric)) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(numeric) / Math.log(1024)), units.length - 1)
  const size = numeric / 1024 ** index
  return `${formatNumber(size.toFixed(index === 0 ? 0 : 2))} ${units[index]}`
}

const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

const getFileName = (key = '') => key.split('/').pop() || key || '—'

const rows = computed(() =>
  files.value.map(file => ({
    ...file,
    name: getFileName(file.key),
    size: formatFileSize(file.size),
    lastModified: formatDateTime(file.lastModified)
  }))
)

const refresh = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await $authFetch(`/api/backend/projects/${props.projectId}/manage/files/knowledge-base`)
    files.value = response?.files || []
    console.log(files.value)
  } catch (error) {
    errorMessage.value = 'No se pudo cargar el listado de archivos.'
    files.value = []
  } finally {
    isLoading.value = false
  }
}

defineExpose({ refresh })

onMounted(async () => {
  await refresh()
})
</script>

<template>
  <div class="space-y-4 border border-accented rounded-md">
    <UTable
      :data="rows"
      :columns="columns"
      :loading="isLoading"
    >
      <template #empty>
        <div class="py-6 text-center text-sm text-muted">
          No hay archivos disponibles.
        </div>
      </template>

      <template #actions-cell="{ row }">
        <UButton
          :to="row.original.url"
          target="_blank"
          rel="noopener noreferrer"
          icon="lucide:external-link"
          variant="ghost"
          color="primary"
          size="xs"
        >
          Abrir
        </UButton>
      </template>
    </UTable>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="subtle"
      :title="errorMessage"
    />
  </div>
</template>

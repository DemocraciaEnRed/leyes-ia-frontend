<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const projectId = computed(() => String(route.params.projectId || ''))

const {
  data: dataResponse,
  status,
  error,
  refresh
} = await useAuthFetch<any>(`/api/backend/projects/${projectId.value}/manage`)

const { user } = useAuth()

const project = computed(() => dataResponse.value?.project)
const currentUserMembership = computed(() => dataResponse.value?.currentUserMembership || null)
const projectName = computed(() => project.value?.name || 'Configuración del Hub')
const canManageMembers = computed(() => {
  if (user.value?.role === 'admin') {
    return true
  }

  const projectRole = currentUserMembership.value?.projectRole
  return projectRole === 'owner' || projectRole === 'manager'
})
</script>

<template>
  <NuxtLayout name="panel-proyecto">
    <UPageHeader
      :title="projectName"
      description="Aquí puedes configurar los detalles y preferencias de tu Hub de proyecto de ley, incluyendo información general, gestión de miembros, integración con herramientas externas y ajustes de privacidad. Personaliza tu Hub para facilitar la colaboración y el desarrollo efectivo del proyecto de ley."
    />
    <UPageBody class="space-y-4">
      <UProgress
        v-if="status === 'pending'"
        animation="swing"
      />

      <UAlert
        v-if="status === 'error'"
        title="Error al cargar la configuración"
        :description="error?.message || 'No se pudo cargar la información del proyecto.'"
        color="error"
        variant="subtle"
        icon="lucide:alert-circle"
      />

      <ProjectPublicationCard
        v-if="status === 'success'"
        :project-id="projectId"
        :project="project"
        @updated="refresh"
      />

      <ProjectMembersManager
        v-if="status === 'success'"
        :project-id="projectId"
        :can-manage="canManageMembers"
      />

      <UPageCard
        variant="outline"
        class="bg-elevated"
      >
        <p class="text-sm text-muted">
          Próximamente: nuevos segmentos de configuración del Hub.
        </p>
      </UPageCard>
    </UPageBody>
  </NuxtLayout>
</template>

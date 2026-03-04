<script setup>
const { user, isLegislator } = useAuth()

definePageMeta({
  middleware: 'auth'
})

const { data: hubsData, status, error, refresh } = await useAuthFetch('/api/backend/projects', {
  query: {
    scope: 'managed'
  }
})

const links = computed(() => {
  if (isLegislator.value) {
    return [
      {
        label: 'Nuevo proyecto',
        icon: 'lucide:plus-circle',
        to: '/proyectos/panel/nuevo'
      },
      {
        label: 'Refrescar',
        icon: 'lucide:refresh-cw',
        onClick: () => refresh()
      }
    ]
  }

  return [
    {
      label: 'Refrescar',
      icon: 'lucide:refresh-cw',
      onClick: () => refresh()
    }
  ]
})

const emptyActions = computed(() => {
  if (isLegislator.value) {
    return [
      {
        icon: 'lucide:plus-circle',
        label: 'Nuevo proyecto',
        color: 'neutral',
        variant: 'solid',
        class: 'cursor-pointer',
        to: '/proyectos/panel/nuevo'
      },
      {
        icon: 'lucide:refresh-cw',
        label: 'Refrescar',
        color: 'neutral',
        variant: 'outline',
        class: 'cursor-pointer',
        onClick: () => refresh()
      }
    ]
  }

  return [
    {
      icon: 'lucide:refresh-cw',
      label: 'Refrescar',
      color: 'neutral',
      variant: 'outline',
      class: 'cursor-pointer',
      onClick: () => refresh()
    }
  ]
})

// const tableData = computed(() => {
//     console.log('hubsData:', hubsData.value);
//     if(hubsData.value.projects && hubsData.value.projects.length > 0) {
//         return hubsData.value.projects.map(project => ({
//             Name: project.name,
//             CreatedAt: new Date(project.createdAt).toLocaleDateString({ year: 'numeric', month: 'long', day: 'numeric' }),
//         }));
//     }
//     return [];
// });
</script>

<template>
  <NuxtLayout name="panel-legislador">
    <UPageHeader
      title="Mis proyectos"
      :links="links"
    />
    <UPageBody>
      <UAlert
        v-if="user?.role === 'user'"
        title="Acceso como integrante"
        description="Podés participar en proyectos y equipos donde te hayan agregado. La creación de nuevos proyectos está habilitada solo para legisladores."
        color="info"
        variant="subtle"
        icon="lucide:info"
        class="mb-4"
      />
      <UProgress
        v-if="status == 'pending'"
        animation="swing"
      />
      <UAlert
        v-if="status == 'error'"
        title="Error al cargar los proyectos"
        :description="error.message || 'Ocurrió un error inesperado al intentar cargar tus proyectos.'"
        color="danger"
        variant="subtle"
        icon="lucide:alert-circle"
      />
      <UEmpty
        v-if="status == 'success' && hubsData.projects.length === 0"
        variant="naked"
        icon="lucide:inbox"
        title="Sin proyectos"
        class="mx-auto"
        :description="isLegislator ? 'Aún no tenés proyectos. Creá uno nuevo para empezar.' : 'Aún no tenés proyectos asignados. Cuando te sumen a un equipo, aparecerán acá.'"
        :actions="emptyActions"
      />
      <div
        v-if="status == 'success'"
        class="space-y-4"
      >
        <UPageList
          :items="hubsData.projects"
          class="space-y-4"
          divide
        >
          <UPageCard
            v-for="project in hubsData.projects"
            :key="project.id"
            variant="subtle"
          >
            <div class="flex flex-col md:flex-row lg:justify-between lg:items-start">
              <div class="mr-3 md:w-10/12 space-y-1">
                <UFieldGroup>
                  <UBadge
                    color="neutral"
                    variant="outline"
                    class="capitalize"
                  >
                    Estado
                  </UBadge>
                  <UBadge
                    color="neutral"
                    variant="subtle"
                    class="capitalize"
                  >
                    {{ project.status }}
                  </UBadge>
                </UFieldGroup>
                <h3 class="font-bold text-2xl">
                  {{ project.name }}
                </h3>
                <p
                  v-if="project.status == 'ready'"
                  class="text-sm text-muted mt-1"
                >
                  {{ project.description }}
                </p>
                <p
                  v-else
                  class="text-sm text-muted mt-1 italic"
                >
                  El proyecto está en proceso de creación. Genere el <NuxtLink
                    :to="`/proyectos/panel/${project.id}/resumen`"
                    class="underline text-primary"
                  >resumen del proyecto</NuxtLink>.
                </p>
              </div>
              <div class="flex flex-col md:w-2/12 md:items-end gap-1 pt-4 md:pt-0">
                <UButton
                  :to="`/proyectos/panel/${project.id}`"
                  color="neutral"
                  variant="subtle"
                  trailing-icon="lucide:arrow-right"
                >
                  Ver panel
                </UButton>
                <UButton
                  :to="`/proyectos/${project.slug || project.id}`"
                  variant="link"
                  target="_blank"
                  class="md:ml-2 mt-2 md:mt-0"
                  trailing-icon="lucide:external-link"
                >
                  Ir al hub
                </UButton>
              </div>
            </div>
          </UPageCard>
        </UPageList>
      </div>
      <!-- <div>
                <UButton @click="getUserData" color="secondary" variant="outline">
                    Test Auth Fetch
                </UButton>
            </div> -->
    </UPageBody>
  </NuxtLayout>
</template>

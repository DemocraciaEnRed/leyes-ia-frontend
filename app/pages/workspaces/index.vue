<script setup>
    const { ref } = await import('vue');
    const runtimeConfig = useRuntimeConfig()

    const { data: workspacesData, pending, status, error, refresh } = await useFetch(`${runtimeConfig.public.apiUrl}/projects?draft=true`);
    
    const links = ref([
        {
          label: 'Mi Perfil',
          icon: 'lucide:star',
          to: '/user/profile'
        },
         {
          label: 'Mi Equipo',
          icon: 'lucide:star',
          to: '/user/team'
        },
  {
    label: 'Workspaces',
    icon: 'lucide:file-pen',
    to: '/workspaces'
  },
])

// const tableData = computed(() => {
//     console.log('workspacesData:', workspacesData.value);
//     if(workspacesData.value.projects && workspacesData.value.projects.length > 0) {
//         return workspacesData.value.projects.map(project => ({
//             Name: project.name,
//             CreatedAt: new Date(project.createdAt).toLocaleDateString({ year: 'numeric', month: 'long', day: 'numeric' }),
//         }));
//     }
//     return [];
// });

</script>

<template>
<NuxtLayout name="user-settings">

        <UPageHeader title="Mis workspaces" />
        <UPageBody >
               <LoadingCard v-if="status == 'pending'" />
               <UAlert v-else-if="status == 'success' && workspacesData.projects.length === 0"
                title="No tenés workspaces aún"
                description="Creá un nuevo workspace para comenzar a trabajar en tus proyectos."
                color="info"
                variant="subtle"
                icon="lucide:info-circle"
               />

                <UAlert v-else-if="status == 'error'"
                title="Error al cargar los workspaces"
                :description="error.message || 'Ocurrió un error inesperado al intentar cargar tus workspaces.'"
                color="danger"
                variant="subtle"
                icon="lucide:alert-circle"
               />
                <UPageList v-else :items="workspacesData.projects" class="space-y-4">
                    <UPageCard v-for="project in workspacesData.projects" :key="project.id" >
                        <div class="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div class="mb-4 md:mb-0">
                                <h3 class="font-semibold">{{ project.name }}</h3>
                                <p class="text-gray-600 text-sm">Creado el: {{ new Date(project.createdAt).toLocaleDateString() }}</p>
                            </div>
                            <div class="flex flex-col md:flex-row md:items-center">
                                <UButton :to="`/workspaces/${project.id}`" color="neutral" variant="subtle">
                                    Ir al Workspace
                                </UButton>
                            </div>
                        </div>
                    </UPageCard>
                </UPageList> 
        </UPageBody>
    </NuxtLayout>

</template>
<script setup>
const { ref } = await import('vue');
const runtimeConfig = useRuntimeConfig()
const { session } = useAuth();

definePageMeta({
    middleware: 'auth'
})

const { data: hubsData, pending, status, error, refresh } = await useFetch(`${runtimeConfig.public.backendUrl}/projects?draft=true`);


const links = ref([
    {
        label: 'Nuevo proyecto',
        icon: 'lucide:plus-circle',
        to: `/legislador/hubs/nuevo`
    },
    {
        label: 'Refrescar',
        icon: 'lucide:refresh-cw',
        onClick: () => refresh()
    }
]);



const getUserData = async () => {
    const userDataResponse = await $authFetch(`/api/backend/test/whoami`, {
        method: 'GET',
    });
    console.log("Fetched user data:", userDataResponse);
}

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
        <UPageHeader title="Mis proyectos" :links="links" />
        <UPageBody>
            <UProgress animation="swing" v-if="status == 'pending'" />
            <UAlert v-if="status == 'error'" title="Error al cargar los proyectos"
                :description="error.message || 'Ocurrió un error inesperado al intentar cargar tus proyectos.'"
                color="danger" variant="subtle" icon="lucide:alert-circle" />
            <UEmpty
                v-if="status == 'success' && hubsData.projects.length === 0"
                variant="naked"
                icon="lucide:inbox"
                title="Sin proyectos"
                class="mx-auto"
                description="Aun no tenés proyectos. Subí un nuevo proyecto para comenzar a crear espacios de participacion"
                :actions="[
                {
                    icon: 'lucide:plus-circle',
                    label: 'Nuevo proyecto',
                    color: 'neutral',
                    variant: 'solid',
                    class: 'cursor-pointer',
                    to: `/legislador/hubs/nuevo`
                },
                {
                    icon: 'lucide:refresh-cw',
                    label: 'Refrescar',
                    color: 'neutral',
                    variant: 'outline',
                    class: 'cursor-pointer',
                    onClick: () => refresh()
                }
                ]"
            />
            <div v-if="status == 'success'" class="space-y-4">

                <UPageList :items="hubsData.projects" class="space-y-4" divide>
                    <UPageCard v-for="project in hubsData.projects" :key="project.id" variant="subtle">
                        <div class="flex flex-col md:flex-row lg:justify-between lg:items-start">
                            <div class="mr-3 md:w-10/12 space-y-1">
                                <UFieldGroup>
                                    <UBadge color="neutral" variant="outline" class="capitalize">Estado</UBadge>
                                    <UBadge color="neutral" variant="subtle" class="capitalize">{{ project.status }}</UBadge>
                                </UFieldGroup>
                                <h3 class="font-bold text-2xl">{{ project.name }}</h3>
                                <p class="text-sm text-muted mt-1" v-if="project.status == 'ready'">{{ project.description }}</p>
                                <p class="text-sm text-muted mt-1 italic" v-else>El proyecto está en proceso de creación. Genere el <NuxtLink :to="`/legislador/hubs/${project.id}/resumen`" class="underline text-primary">resumen del proyecto</NuxtLink>.</p>
                            </div>
                            <div class="flex flex-col md:w-2/12 md:items-end gap-1 pt-4 md:pt-0">
                                <UButton :to="`/legislador/hubs/${project.id}`" color="neutral" variant="subtle"  trailing-icon="lucide:arrow-right">
                                    Ver panel
                                </UButton>
                                <UButton :to="`/proyectos/${project.id}`" variant="link" target="_blank" class="md:ml-2 mt-2 md:mt-0" trailing-icon="lucide:external-link">
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
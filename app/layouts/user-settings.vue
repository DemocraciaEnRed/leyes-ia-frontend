<script setup>

const route = useRoute();
const projectId = route.params.projectId;


const goBackLink = [
    {
        label: 'Inicio',
        icon: 'lucide:arrow-left-circle',
        to: `/`
    },
]

const linksWorkspaces = ref([
    {
        label: 'Nuevo proyecto',
        icon: 'lucide:plus-circle',
        to: `/workspaces/new`
    },
    {
        label: 'Mis proyectos',
        icon: 'lucide:folder',
        to: `/workspaces`
    },
])


const userLinks = ref([
    {
        label: 'Mi Perfil',
        icon: 'lucide:user',
        to: '/user/profile'
    },
        {
        label: 'Mi Equipo',
        icon: 'lucide:network',
        to: '/user/team'
    },
])
</script>

<template>
    <AppHeader />
    <UMain>
        <UContainer class="max-w-11/12">
            <UPage>
                <template #left>
                    <UPageAside>
                        <UPageCard variant="soft">
                            <UPageLinks :links="goBackLink" />
                            <USeparator />
                            <UPageLinks :links="linksWorkspaces" title="Workspaces" />
                            <USeparator />
                            <UPageLinks :links="userLinks" title="Mi cuenta" />
                            <USeparator />

                        </UPageCard>
                    </UPageAside>
                </template>
                <slot />
            </UPage>
        </UContainer>
    </UMain>
    <AppFooter />
</template>
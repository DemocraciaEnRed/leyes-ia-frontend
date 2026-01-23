<script setup>

const route = useRoute();
const projectId = route.params.projectId;


const goBackLink = [
    {
        label: 'Mis Workspaces',
        icon: 'lucide:arrow-left-circle',
        to: `/workspaces`
    },
]

const links = ref([
    {
        label: 'Dashboard',
        icon: 'lucide:home',
        to: `/workspaces/${projectId}`
    },
    {
        label: 'Ir al proyecto',
        icon: 'lucide:external-link',
        to: `/projects/${projectId}`,
        target: '_blank'
    }
])

const proyectoLinks = ref([
    {
        label: 'Documento',
        icon: 'lucide:file-text',
        to: `/workspaces/${projectId}/view`
    },
    {
        label: 'Configuración',
        icon: 'lucide:edit-3',
        to: `/workspaces/${projectId}/edit`
    },
])

const pageItems = ref([
    {
        label: 'Editar campos',
        icon: 'lucide:edit-3',
        to: `/workspaces/${projectId}/edit`
    },
    {
        label: 'Comentarios'
    }
])

const participationItems = ref([
    {
        label: 'Chats',
        icon: 'lucide:check-square',
        to: `/workspaces/${projectId}/chats`
    },
    {
        label: 'Analisis',
        icon: 'lucide:users',
        to: `/workspaces/${projectId}/analysis`
    },
    {
        label: 'Comentarios',
        icon: 'lucide:message-square',
        to: `/workspaces/${projectId}/comments`
    },
])
const surveyItems = ref([
    {
        label: 'Crear nueva',
        icon: 'lucide:clipboard-plus',
        to: `/workspaces/${projectId}/surveys/new`
        
    },
    {
        label: 'Ver encuestas',
        icon: 'lucide:clipboard-list',
        to: `/workspaces/${projectId}/surveys`
    },
])

// const linksItems = ref([
//     {
//         label: 'Mis Workspaces',
//         icon: 'lucide:arrow-left-circle',
//         to: `/workspaces`
//     },
//    {
//       label: 'Links',
//       type: 'label'
//     },
//     {
//         label: 'Dashboard',
//         icon: 'lucide:home',
//         to: `/workspaces/${projectId}`
//     },
//     {
//         label: 'Ir al proyecto',
//         icon: 'lucide:external-link',
//         to: `/projects/${projectId}`,
//         target: '_blank'
//     },
//     {
//         label: 'Proyecto',
//         type: 'label'
//     },
//     {
//         label: 'Editar resumen',
//         icon: 'lucide:edit-3',
//         to: `/workspaces/${projectId}/edit`
//     },
//     {
//         label: 'Componentes',
//         type: 'label'
//     },
//     {
//         label: 'Comentarios',
//         icon: 'lucide:message-square',
//         to: `/workspaces/${projectId}/comments`
//     },
//     {
//         label: 'Encuestas',
//         icon: 'lucide:message-circle',
//         to: `/workspaces/${projectId}/surveys`,
//         children: surveyItems.value
//     },
//     {
//         label: 'Chats',
//         icon: 'lucide:check-square',
//         to: `/workspaces/${projectId}/chats`
//     },
//     {
//         label: 'Analisis',
//         icon: 'lucide:users',
//         to: `/workspaces/${projectId}/analysis`
//     },
// ])
</script>

<template>
    <AppHeader />
    <UMain>
        <UContainer class="max-w-10/12">
        <!-- <UContainer class=""> -->
            <UPage>
                <template #left>
                    <UPageAside>
                        <div class="space-y-3 px-4 rounded-xl py-2">

                            <UPageLinks :links="goBackLink" />
                            <USeparator />
                            <UPageAnchors :links="links" />
                            <USeparator />
                            <UPageLinks :links="proyectoLinks" title="Configuración" />
                            <USeparator />
                            <UPageLinks :links="pageItems" title="Resumen" />
                            <USeparator/>
                            <UPageLinks :links="surveyItems" title="Encuestas"/>
                            <USeparator/>
                            <UPageLinks :links="participationItems" title="Componentes"/>
                        </div>
                    </UPageAside>
                </template>
                <slot />
            </UPage>
        </UContainer>
    </UMain>
    <AppFooter />
</template>
<script setup lang="ts">
import { collapsible } from '#build/ui';
import type { NavigationMenuItem } from '@nuxt/ui';

const route = useRoute();
const projectId = route.params.projectId;

const items = ref<NavigationMenuItem[]>([
    [
        {
            label: 'Mis proyectos',
            icon: 'lucide:arrow-left-circle',
            to: '/legislador/hubs'
        }
    ],
    [
        {
            label: 'Dashboard',
            icon: 'lucide:home',
            to: `/legislador/hubs/${projectId}`
        },
        {
            label: 'Ir al hub',
            icon: 'lucide:external-link',
            to: `/proyectos/${projectId}`,
            target: '_blank'
        }
    ],
    [
        {
            label: 'Componentes',
            icon: 'lucide:layout-dashboard',
            defaultOpen: true,
            active: route.path.includes('/resumen') || route.path.includes('/encuestas') || route.path.includes('/comentarios') || route.path.includes('/chats'),
            children: [
                {
                    label: 'Resumen',
                    icon: 'lucide:file-text',
                    to: `/legislador/hubs/${projectId}/resumen`,
                    active: route.path.includes('/resumen')
                },
                {
                    label: 'Encuestas',
                    icon: 'lucide:clipboard-list',
                    to: `/legislador/hubs/${projectId}/encuestas`,
                    active: route.path.includes('/encuestas')
                },
                {
                    label: 'Comentarios',
                    icon: 'lucide:message-square',
                    to: `/legislador/hubs/${projectId}/comentarios`,
                    class: 'opacity-50 cursor-not-allowed'
                },
                {
                    label: 'Chats',
                    icon: 'lucide:check-square',
                    to: `/legislador/hubs/${projectId}/chats`,
                    class: 'opacity-50 cursor-not-allowed'
                },
                {
                    label: 'Posters',
                    icon: 'lucide:presentation',
                    disabled: true,
                    class: 'opacity-50 cursor-not-allowed'
                },
                {
                    label: 'Media',
                    icon: 'lucide:images',
                    disabled: true,
                    class: 'opacity-50 cursor-not-allowed'
                }
            ]
        }
    ],
    [
        {
            label: 'Configuración',
            icon: 'lucide:settings',
            defaultOpen: true,
            active: route.path.includes('/configuracion'),
            children: [
                {
                    label: 'Configuración del Hub',
                    icon: 'lucide:settings',
                    to: `/legislador/hubs/${projectId}/configuracion/hub`
                },
                {
                    label: 'Documentos',
                    icon: 'lucide:folder-open',
                    disabled: true,
                    class: 'opacity-50 cursor-not-allowed'
                },
                {
                    label: 'Base de Conocimiento',
                    icon: 'lucide:book-open',
                    to: `/legislador/hubs/${projectId}/configuracion/base-de-conocimiento`
                },
                {
                    label: 'Miembros',
                    icon: 'lucide:users',
                    disabled: true,
                    class: 'opacity-50 cursor-not-allowed'
                }
            ]
        }
    ]
]);

</script>

<template>
    <AppHeader />
    <UMain>
        <div class="lg:hidden border-b border-default">
            <UCollapsible class="flex flex-col" :unmount-on-hide="true">
                <UButton
                    class="group cursor-pointer py-2 rounded-none"
                    label="Menú"
                    icon="lucide:menu"
                    color="neutral"
                    variant="soft"
                    trailing-icon="i-lucide-chevron-down"
                    :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
                    block
                />

                <template #content>
                    <UNavigationMenu :items="items" orientation="vertical" color="neutral" :highlight="true" class="py-2 px-4 border-t border-default" />
                </template>
            </UCollapsible>
        </div>
        <UContainer>
            <UPage>
                <template #left>
                    <UPageAside>
                        <UNavigationMenu :items="items" orientation="vertical" color="neutral" :highlight="true" />
                    </UPageAside>
                </template>
                <slot />
            </UPage>
        </UContainer>
    </UMain>
    <AppFooter />
</template>
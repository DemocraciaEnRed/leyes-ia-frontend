<script setup lang="ts">
import { collapsible } from '#build/ui';
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute();
const projectId = route.params.projectId;


const items = ref<NavigationMenuItem[]>([
    [{
        label: 'Volver al home',
        icon: 'lucide:home',
        to: '/' 
    }],[
    {
        label: 'Mis proyectos',
        icon: 'lucide:folder',
        defaultOpen:true,
        color: 'neutral',
        active: route.path.startsWith('/legislador/hubs'),
        children: [
            {
                label: 'Nuevo proyecto',
                icon: 'lucide:plus-circle',
                to: `/legislador/hubs/nuevo`
            },
            {
                label: 'Mis proyectos',
                icon: 'lucide:folders',
                to: `/legislador/hubs`,
            }
        ]
    }],
])

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
                :ui="{
                    trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
                }"
            block
            />
            
            <template #content>
                <UNavigationMenu :items="items" orientation="vertical" color="neutral" :highlight="true" class="py-2 px-4 border-t border-default" />
            </template>
        </UCollapsible>
    </div>
        <UContainer >
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
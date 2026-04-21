<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  [
    {
      label: 'Volver al home',
      icon: 'lucide:home',
      to: '/'
    }
  ],
  [
    {
      label: 'Dashboard',
      icon: 'lucide:chart-bar',
      to: '/admin/dashboard',
      active: route.path === '/admin/dashboard'
    }
  ],
  [
    {
      label: 'Legisladores',
      icon: 'lucide:users',
      defaultOpen: true,
      active: route.path.startsWith('/admin/legisladores'),
      children: [
        {
          label: 'Lista',
          icon: 'lucide:list',
          to: '/admin/legisladores',
          active: route.path === '/admin/legisladores'
        },
        {
          label: 'Nuevo Legislador',
          icon: 'lucide:plus-circle',
          to: '/admin/legisladores/nuevo',
          active: route.path === '/admin/legisladores/nuevo'
        }
      ]
    }
  ],
  [
    {
      label: 'Partidos Políticos',
      icon: 'lucide:landmark',
      defaultOpen: true,
      active: route.path.startsWith('/admin/partidos-politicos'),
      children: [
        {
          label: 'Lista',
          icon: 'lucide:list',
          to: '/admin/partidos-politicos',
          active: route.path === '/admin/partidos-politicos'
        },
        {
          label: 'Nuevo Partido',
          icon: 'lucide:plus-circle',
          to: '/admin/partidos-politicos/nuevo',
          active: route.path === '/admin/partidos-politicos/nuevo'
        }
      ]
    }
  ]
])

const sidebarOpen = ref(true)
</script>

<template>
  <div>
    <AppHeader />
    <ProfileCompletionBanner />
    <UMain>
      <div class="lg:hidden border-b border-default">
        <UButton
          class="cursor-pointer py-2 rounded-none"
          label="Menú"
          icon="lucide:menu"
          color="neutral"
          variant="soft"
          block
          @click="sidebarOpen = true"
        />
      </div>
      <div class="flex">
        <USidebar
          v-model:open="sidebarOpen"
          collapsible="offcanvas"
          mode="drawer"
          :ui="{
            container: 'top-(--ui-header-height) h-[calc(100svh-var(--ui-header-height))]'
          }"
        >
          <UNavigationMenu
            :items="items"
            orientation="vertical"
            color="neutral"
            :highlight="true"
          />
        </USidebar>
        <div class="flex-1 min-w-0">
          <UContainer>
            <slot />
          </UContainer>
        </div>
      </div>
    </UMain>
    <AppFooter />
  </div>
</template>

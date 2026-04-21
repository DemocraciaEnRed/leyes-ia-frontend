<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { isLegislator } = useAuth()

const items = computed<NavigationMenuItem[]>(() => {
  const children: NavigationMenuItem[] = [
    {
      label: 'Mis proyectos',
      icon: 'lucide:folders',
      to: '/cuenta/proyectos'
    }
  ]

  if (isLegislator.value) {
    children.unshift({
      label: 'Nuevo proyecto',
      icon: 'lucide:plus-circle',
      to: '/proyectos/panel/nuevo'
    })
  }

  return [
    [{
      label: 'Volver al home',
      icon: 'lucide:home',
      to: '/'
    }], [
      {
        label: 'Mis proyectos',
        icon: 'lucide:folder',
        defaultOpen: true,
        color: 'neutral',
        active: route.path.startsWith('/cuenta/proyectos') || route.path.startsWith('/proyectos/panel'),
        children
      }
    ]
  ]
})

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

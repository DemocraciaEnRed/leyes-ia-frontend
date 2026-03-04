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
      label: 'Mi cuenta',
      icon: 'lucide:user',
      defaultOpen: true,
      active: route.path.startsWith('/mi-cuenta'),
      children: [
        {
          label: 'Perfil',
          icon: 'lucide:user-round',
          to: '/mi-cuenta/perfil',
          active: route.path === '/mi-cuenta/perfil'
        }
      ]
    }
  ],
  [
    {
      label: 'Proyectos',
      icon: 'lucide:folder',
      to: '/cuenta/proyectos'
    }
  ]
])
</script>

<template>
  <div>
    <AppHeader />
    <ProfileCompletionBanner />
    <UMain>
      <div class="lg:hidden border-b border-default">
        <UCollapsible
          class="flex flex-col"
          :unmount-on-hide="true"
        >
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
            <UNavigationMenu
              :items="items"
              orientation="vertical"
              color="neutral"
              :highlight="true"
              class="py-2 px-4 border-t border-default"
            />
          </template>
        </UCollapsible>
      </div>
      <UContainer>
        <UPage>
          <template #left>
            <UPageAside>
              <UNavigationMenu
                :items="items"
                orientation="vertical"
                color="neutral"
                :highlight="true"
              />
            </UPageAside>
          </template>
          <slot />
        </UPage>
      </UContainer>
    </UMain>
    <AppFooter />
  </div>
</template>

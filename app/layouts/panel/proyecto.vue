<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const projectId = route.params.projectId

const { data: projectResponse } = await useFetch(`/api/backend/projects/${projectId}/manage`)

const publicProjectPath = computed(() => {
  const projectSlug = projectResponse.value?.project?.slug
  return `/proyectos/${projectSlug || projectId}`
})

const items = ref<NavigationMenuItem[]>([
  [
    {
      label: 'Mis proyectos',
      icon: 'lucide:arrow-left-circle',
      to: '/cuenta/proyectos'
    }
  ],
  [
    {
      label: 'Dashboard',
      icon: 'lucide:home',
      to: `/proyectos/panel/${projectId}`
    },
    {
      label: 'Ir al hub',
      icon: 'lucide:external-link',
      to: publicProjectPath.value,
      target: '_blank'
    }
  ],
  [
    {
      label: 'Componentes',
      icon: 'lucide:layout-dashboard',
      defaultOpen: true,
      active: route.path.includes('/resumen') || route.path.includes('/encuestas') || route.path.includes('/comentarios') || route.path.includes('/chats') || route.path.includes('/citas-legisladores') || route.path.includes('/prediccion-votaciones'),
      children: [
        {
          label: 'Resumen',
          icon: 'lucide:file-text',
          to: `/proyectos/panel/${projectId}/resumen`,
          active: route.path.includes('/resumen')
        },
        {
          label: 'Encuestas',
          icon: 'lucide:clipboard-list',
          to: `/proyectos/panel/${projectId}/encuestas`,
          active: route.path.includes('/encuestas')
        },
        {
          label: 'Citas de Legisladores',
          icon: 'lucide:quote',
          to: `/proyectos/panel/${projectId}/citas-legisladores`,
          active: route.path.includes('/citas-legisladores')
        },
        {
          label: 'Predicción de Votaciones',
          icon: 'lucide:vote',
          to: `/proyectos/panel/${projectId}/prediccion-votaciones`,
          active: route.path.includes('/prediccion-votaciones')
        },
        {
          label: 'Comentarios',
          icon: 'lucide:message-square',
          to: `/proyectos/panel/${projectId}/comentarios`,
          class: 'opacity-50 cursor-not-allowed'
        },
        {
          label: 'Chats',
          icon: 'lucide:check-square',
          to: `/proyectos/panel/${projectId}/chats`,
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
          to: `/proyectos/panel/${projectId}/configuracion/hub`
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
          to: `/proyectos/panel/${projectId}/configuracion/base-de-conocimiento`
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
])

watch(publicProjectPath, (nextPath) => {
  const projectLinks = items.value?.[1]

  if (Array.isArray(projectLinks) && projectLinks[1]) {
    projectLinks[1].to = nextPath
  }
}, { immediate: true })

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

<script setup lang="ts">

const navigationLinks = [
    {
    label: 'Home',
    to: '/',
    icon: 'lucide:home',
    children: []
}, {
    label: 'Proyectos',
    to: '/projects',
    icon: 'lucide:file',
  },
  {
    label: 'Acerca de',
    to: '/about',
    icon: 'lucide:info',
  }
];

const items = ref([
  [
    {
      label: 'Guillecro',
      avatar: {
        src: 'https://github.com/guillecro.png'
      },
      type: 'label'
    }
  ],
  [
    {
      label: 'Perfil',
      icon: 'lucide:user'
    },
    {
      label: 'Configuración',
      icon: 'lucide:settings',
    },
  ],
   [
    {
      label: 'Mis workspaces',
      icon: 'lucide:folder',
      to: '/workspaces'
      
    },
    {
      label: 'Nuevo workspace',
        icon: 'lucide:plus-circle',
        to: '/workspaces/new'
    }
  ],
  [
    {
      label: 'Mi equipo',
      icon: 'lucide:users',
      disabled: true,
    },
    {
      label: 'Nuevo equipo',
      icon: 'lucide:plus-circle',
      disabled: true,
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'lucide:log-out',
    }
  ]
])
</script>

<template>
    <UHeader>
        <template #left>
            <NuxtLink to="/" class="text-lg font-bold">
               <AppLogo class="h-8 w-auto" />
            </NuxtLink>
        </template>
        <template #right>
            <UColorModeButton />
            <UDropdownMenu :items="items">
                <UButton icon="i-lucide-menu" color="neutral" variant="outline">
                    Menú
                </UButton>
            </UDropdownMenu>
        </template>
        <UNavigationMenu :items="navigationLinks" />
    </UHeader>
</template>
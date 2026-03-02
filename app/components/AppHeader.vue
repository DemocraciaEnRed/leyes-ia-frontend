<script setup lang="ts">
const { user, loggedIn, logout, isAdmin, isLegislator } = useAuth()
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const navigationLinks = <NavigationMenuItem[]>[
  {
    label: 'Home',
    to: '/',
    icon: 'lucide:home',
    children: []
  }, {
    label: 'Proyectos',
    to: '/proyectos',
    icon: 'lucide:file'
  },
  {
    label: 'Acerca de',
    to: '/acerca-de',
    icon: 'lucide:info'
  }
]

const dropdownItems = computed<DropdownMenuItem[][]>(() => {
  if (!loggedIn.value) {
    return [
      [
        {
          label: 'Iniciar sesión',
          icon: 'lucide:log-in',
          to: '/auth/login'
        },
        {
          label: 'Registrarse',
          icon: 'lucide:user-plus',
          to: '/auth/signup'
        }
      ]
    ]
  }

  const userMenuItems: DropdownMenuItem[][] = [
    [
      {
        label: user.value?.fullName || 'User',
        avatar: {
          src: user.value?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.value?.fullName || 'User')}`
        },
        type: 'label'
      }
    ],
    [
      {
        label: 'Perfil',
        icon: 'lucide:user',
        to: '/user/perfil'
      },
    ],
  ]

  // Add role-specific menu items
  if (isAdmin.value || isLegislator.value) {
    const roleItems: DropdownMenuItem[] = []

    if (isAdmin.value) {
      roleItems.push({
        label: 'Admin Dashboard',
        icon: 'lucide:shield',
        to: '/admin/dashboard'
      })
    }

    if (isLegislator.value) {
      roleItems.push({
        label: 'Mis proyectos',
        icon: 'lucide:folder',
        to: '/cuenta/proyectos'
      })
      roleItems.push({
        label: 'Nuevo proyecto',
        icon: 'lucide:plus-circle',
        to: '/proyectos/panel/nuevo'
      })
    }

    userMenuItems.push(roleItems)
  }

  const closeSessionItem: DropdownMenuItem = {
    label: 'Cerrar sesión',
    icon: 'lucide:log-out',
    color: 'error',
    onClick: () => logout()
  }
   userMenuItems.push([closeSessionItem])

  return userMenuItems
})
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink
        to="/"
        class="text-lg font-bold"
      >
        <AppLogo class="h-8 w-auto" />
      </NuxtLink>
    </template>
    <UNavigationMenu :items="navigationLinks" />
    <template #right>
      <UColorModeButton />

      <UDropdownMenu
        :items="dropdownItems"
        class="hidden lg:flex"
        :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
        :arrow="true"
      >
        <UButton
          icon="lucide:menu"
          color="neutral"
          variant="outline"
          class="cursor-pointer"
        >
          Menú
        </UButton>
      </UDropdownMenu>
    </template>
    <template #body>
      <UNavigationMenu
        :items="navigationLinks"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>

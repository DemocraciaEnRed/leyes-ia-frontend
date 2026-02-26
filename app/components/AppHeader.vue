<script setup lang="ts">
const { user, loggedIn, logout, isAdmin, isLegislator } = useAuth()
const router = useRouter()

const navigationLinks = [
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

const items = computed(() => {
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

  const userMenuItems = [
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
        label: 'Mis proyectos',
        icon: 'lucide:folder',
        to: '/cuenta/proyectos'
      },
      {
        label: 'Nuevo proyecto',
        icon: 'lucide:plus-circle',
        to: '/proyectos/panel/nuevo'
      }
    ],
    [
      {
        label: 'Perfil',
        icon: 'lucide:user',
        to: '/user/perfil'
      },
      {
        label: 'Configuración',
        icon: 'lucide:settings',
        disabled: true
      }
    ],
    [
      {
        label: 'Cerrar sesión',
        icon: 'lucide:log-out',
        onClick: () => logout()
      }
    ]
  ]

  // Add role-specific menu items
  if (isAdmin.value || isLegislator.value) {
    const roleItems: any[] = []

    if (isAdmin.value) {
      roleItems.push({
        label: 'Admin Dashboard',
        icon: 'lucide:shield',
        to: '/admin/dashboard'
      })
    }

    if (isLegislator.value) {
      roleItems.push({
        label: 'Propuestas Legislativas',
        icon: 'lucide:briefcase',
        to: '/legislator/proposals'
      })
    }

    userMenuItems.push(roleItems)
  }

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
        :items="items"
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
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
const { user, loggedIn, logout, isAdmin, isLegislator } = useAuth()

const items = computed<DropdownMenuItem[][]>(() => {
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
        to: '/mi-cuenta/perfil'
      }
    ]
  ]

  if (isAdmin.value) {
    userMenuItems.push([
      {
        label: 'Admin Dashboard',
        icon: 'lucide:shield',
        to: '/admin/dashboard'
      }
    ])
  }

  if (isLegislator.value) {
    userMenuItems.push([
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
    ])
  }

  userMenuItems.push([
    {
      label: 'Cerrar sesión',
      icon: 'lucide:log-out',
      color: 'error',
      onClick: () => logout()
    }
  ])

  return userMenuItems
})

</script>

<template>
     <AuthState>
    <template #default="{ loggedIn: authLoggedIn }">
      <div class="flex flex-col gap-2 justify-end" v-if="authLoggedIn">
              <UDropdownMenu :items="items" :content="{ align: 'start', side: 'left', sideOffset: 8 }">
                  <UAvatar :src="user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`" :alt="user?.fullName || 'User'" size="3xl" class="cursor-pointer shadow" />
                  <UIcon name="lucide:caret-left" size="16" class="text-white" />
                </UDropdownMenu>
                <div class="text-right">
                    <UColorModeButton variant="solid" color="neutral" />
                </div>
            
        </div>
        <div class="flex flex-col gap-4" v-else>
            <NuxtLink  to="/auth/login"><UIcon name="lucide:log-in" size="36" class="text-white" /></NuxtLink>
            <div class="text-right">
                <UColorModeButton variant="solid" color="neutral" />
            </div>
        </div>
      </template>
      <template #placeholder>
        <UIcon name="lucide:loader-2" size="24" class="animate-spin text-gray-500 opacity-60" />
      </template>
    </AuthState>
</template>
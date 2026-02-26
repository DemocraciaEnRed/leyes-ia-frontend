<script setup lang="ts">
const { user, loggedIn, logout, isAdmin, isLegislator } = useAuth()
const router = useRouter()
import type { DropdownMenuItem } from '@nuxt/ui'

const items = ref<DropdownMenuItem[][]>([
  [
    {
      label: 'Benjamin',
      avatar: {
        src: 'https://github.com/benjamincanac.png'
      },
      type: 'label'
    }
  ],
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user'
    },
    {
      label: 'Billing',
      icon: 'i-lucide-credit-card'
    },
    {
      label: 'Settings',
      icon: 'i-lucide-cog',
      kbds: [',']
    },
    {
      label: 'Keyboard shortcuts',
      icon: 'i-lucide-monitor'
    }
  ],
  [
    {
      label: 'Team',
      icon: 'i-lucide-users'
    },
    {
      label: 'Invite users',
      icon: 'i-lucide-user-plus',
      children: [
        [
          {
            label: 'Email',
            icon: 'i-lucide-mail'
          },
          {
            label: 'Message',
            icon: 'i-lucide-message-square'
          }
        ],
        [
          {
            label: 'More',
            icon: 'i-lucide-circle-plus'
          }
        ]
      ]
    },
    {
      label: 'New team',
      icon: 'i-lucide-plus',
      kbds: ['meta', 'n']
    }
  ],
  [
    {
      label: 'GitHub',
      icon: 'i-simple-icons-github',
      to: 'https://github.com/nuxt/ui',
      target: '_blank'
    },
    {
      label: 'Support',
      icon: 'i-lucide-life-buoy',
      to: '/docs/components/dropdown-menu'
    },
    {
      label: 'API',
      icon: 'i-lucide-cloud',
      disabled: true
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      kbds: ['shift', 'meta', 'q']
    }
  ]
])

const clickLogout = () => {
  logout()
}

</script>

<template>
     <AuthState>
      <template #default="{ loggedIn, clear }">
          <div class="flex flex-col gap- justify-end" v-if="loggedIn">
              <UDropdownMenu :items="items" :content="{ align: 'start', side: 'left', sideOffset: 8 }">
                  <UAvatar :src="user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`" :alt="user?.fullName || 'User'" size="3xl" class="cursor-pointer shadow" />
                  <UIcon name="lucide:caret-left" size="16" class="text-white" />
                </UDropdownMenu>
                <div class="text-right mt-4">
                    <UColorModeButton variant="solid" color="neutral" />
                </div>
            
        </div>
        <div class="flex flex-col gap-5" v-else>
            <NuxtLink  to="/auth/login"><UIcon name="lucide:log-in" size="36" class="text-white" /></NuxtLink>
        </div>

      </template>
      <template #placeholder>
        <UIcon name="lucide:loader-2" size="24" class="animate-spin text-gray-500 opacity-60" />
      </template>
    </AuthState>
</template>
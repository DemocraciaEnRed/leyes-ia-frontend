<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'admin'
})

const { user } = useAuth()

// Example admin data - replace with real API calls
const stats = ref({
  totalUsers: 1234,
  totalProjects: 567,
  activeHubs: 89,
  pendingReviews: 12
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Admin Dashboard</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Welcome back, {{ user?.fullName }}
      </p>
    </div>

    <UAlert
      color="primary"
      variant="soft"
      title="Admin Access"
      description="You are viewing this page because you have admin role privileges."
      icon="i-lucide-shield-check"
      class="mb-8"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            <p class="text-3xl font-bold mt-2">{{ stats.totalUsers }}</p>
          </div>
          <UIcon name="i-lucide-users" class="w-12 h-12 text-primary" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
            <p class="text-3xl font-bold mt-2">{{ stats.totalProjects }}</p>
          </div>
          <UIcon name="i-lucide-folder" class="w-12 h-12 text-primary" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Hubs activos</p>
            <p class="text-3xl font-bold mt-2">{{ stats.activeHubs }}</p>
          </div>
          <UIcon name="i-lucide-briefcase" class="w-12 h-12 text-primary" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Pending Reviews</p>
            <p class="text-3xl font-bold mt-2">{{ stats.pendingReviews }}</p>
          </div>
          <UIcon name="i-lucide-clock" class="w-12 h-12 text-primary" />
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <h3 class="text-xl font-semibold">Recent Activity</h3>
        </template>
        <div class="space-y-4">
          <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <UIcon name="i-lucide-user-plus" class="w-5 h-5 text-green-500" />
            <div class="flex-1">
              <p class="text-sm font-medium">New user registered</p>
              <p class="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <UIcon name="i-lucide-folder-plus" class="w-5 h-5 text-blue-500" />
            <div class="flex-1">
              <p class="text-sm font-medium">Project created</p>
              <p class="text-xs text-gray-500">5 hours ago</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <UIcon name="i-lucide-message-square" class="w-5 h-5 text-purple-500" />
            <div class="flex-1">
              <p class="text-sm font-medium">New comment posted</p>
              <p class="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-xl font-semibold">Quick Actions</h3>
        </template>
        <div class="space-y-3">
          <UButton block variant="soft" icon="i-lucide-users">
            Manage Users
          </UButton>
          <UButton block variant="soft" icon="i-lucide-folder">
            View All Projects
          </UButton>
          <UButton block variant="soft" icon="i-lucide-settings">
            System Settings
          </UButton>
          <UButton block variant="soft" icon="i-lucide-file-text">
            Generate Reports
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user } = useAuth()
</script>

<template>
    <UPage>
        <UPageBody>
            <UPageHeader
                title="Mi Perfil"
                :description="`Gestiona tu información personal, ${user?.firstName}`"
            />
            <UCard class="mt-4">
                <div v-if="user" class="space-y-4">
                  <div>
                    <p class="text-sm text-gray-500">Nombre completo</p>
                    <p class="font-semibold">{{ user.fullName }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Correo electrónico</p>
                    <p class="font-semibold">{{ user.email }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Rol</p>
                    <p class="font-semibold capitalize">{{ user.role }}</p>
                  </div>
                </div>
            </UCard>
        </UPageBody>
    </UPage>
</template>
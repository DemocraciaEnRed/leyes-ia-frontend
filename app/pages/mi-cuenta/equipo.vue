<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user } = useAuth()
</script>

<template>
  <NuxtLayout name="panel-mi-cuenta">
    <UPageHeader
      title="Mi Equipo"
      :description="`Gestiona y colabora con los miembros de tu equipo, ${user?.firstName || ''}`"
    />
    <UPageBody>
      <UCard>
        <p>Funcionalidad de equipo próximamente...</p>
      </UCard>
    </UPageBody>
  </NuxtLayout>
</template>

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
                title="Mi Equipo"
                description="Gestiona y colabora con los miembros de tu equipo."
            />
            <UCard class="mt-4">
                <p>Funcionalidad de equipo próximamente...</p>
            </UCard>
        </UPageBody>
    </UPage>
</template>
<script setup>

</script>

<template>
  <NuxtLayout name="default">
    <UContainer>
      <UPage>
        <UPageHeader
          title="Acerca de"
          description="Información sobre la aplicación y su propósito."
        />
        <UPageBody>
          <UPageCard variant="subtle">
          <HomeQuestions />
          </UPageCard>
        </UPageBody>
      </UPage>
    </UContainer>
  </NuxtLayout>
</template>

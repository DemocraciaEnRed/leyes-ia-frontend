<script setup lang="ts">
const props = defineProps<{
  summary: string
}>()
</script>

<template>
  <UPageSection
    title="Resumen ciudadano"
    description="Esta es la idea central del proyecto, explicada en lenguaje claro para una lectura rápida."
  >
    <template #headline>
      <div class="text-5xl leading-none text-center">
        🧭
      </div>
    </template>

    <UPageCard
      variant="soft"
      class="border border-primary/20"
    >
      <MDC
        :value="props.summary"
        class="px-1 py-1"
      />
    </UPageCard>
  </UPageSection>
</template>

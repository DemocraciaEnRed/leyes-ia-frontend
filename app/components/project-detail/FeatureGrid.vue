<script setup lang="ts">
interface ProjectContent {
  objective?: string
  justification?: string
  key_changes?: string
  impact_on_society?: string
}

const props = defineProps<{
  content: ProjectContent
}>()

const blocks = computed(() => {
  const candidates = [
    {
      key: 'objective',
      title: 'Objetivo',
      icon: 'lucide:target',
      value: props.content.objective || ''
    },
    {
      key: 'justification',
      title: 'Justificación',
      icon: 'lucide:scale',
      value: props.content.justification || ''
    },
    {
      key: 'key_changes',
      title: 'Cambios clave',
      icon: 'lucide:sparkles',
      value: props.content.key_changes || ''
    },
    {
      key: 'impact_on_society',
      title: 'Impacto en la sociedad',
      icon: 'lucide:users',
      value: props.content.impact_on_society || ''
    }
  ]

  return candidates.filter(item => item.value.trim().length > 0)
})
</script>

<template>
  <UPageSection
    title="Puntos clave para el debate"
    description="Los aspectos más importantes para entender qué propone esta ley y por qué importa."
  >
    <template #headline>
      <div class="text-5xl leading-none text-center">
        🗳️
      </div>
    </template>

    <UAlert
      v-if="blocks.length === 0"
      icon="lucide:info"
      color="neutral"
      variant="subtle"
      title="Sin detalles adicionales"
      description="Este proyecto aún no tiene bloques de contenido ampliados."
    />

    <div
      v-else
      class="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      <UPageFeature
        v-for="item in blocks"
        :key="item.key"
        :title="item.title"
        :icon="item.icon"
        orientation="vertical"
        class="h-full rounded-xl border border-default p-4"
      >
        <template #default>
          <MDC
            :value="item.value"
            class="text-sm leading-relaxed"
          />
        </template>
      </UPageFeature>
    </div>
  </UPageSection>
</template>

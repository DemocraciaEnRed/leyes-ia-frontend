<script setup lang="ts">
const props = defineProps<{
  projectTitle: string
}>()

const ctaLinks = computed(() => ([
  {
    label: 'Ver más proyectos',
    to: '/proyectos',
    icon: 'lucide:library',
    color: 'neutral' as const,
    variant: 'subtle' as const
  },
  {
    label: 'Conocer la plataforma',
    to: '/acerca-de',
    trailingIcon: 'lucide:arrow-right'
  }
]))
</script>

<template>
  <UPageCTA
    :title="`Tu voz importa en ${projectTitle}`"
    description="Seguimos sumando espacios de participación: encuestas, comentarios, links de interés y más funcionalidades muy pronto."
    variant="outline"
    :links="ctaLinks"
  >
    <template #top>
      <div class="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">
        <UIcon name="lucide:megaphone" />
        Estilo campaña ciudadana
      </div>
    </template>
  </UPageCTA>
</template>

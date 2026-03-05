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
  </UPageCTA>
</template>

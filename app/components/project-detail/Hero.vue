<script setup lang="ts">
interface HeroProject {
  title?: string | null
  name?: string | null
  description?: string | null
  category?: string | null
  authorFullname?: string | null
  publishedAt?: string | null
  imageUrl?: string | null
  coverImage?: string | null
}

const props = defineProps<{
  project: HeroProject
}>()

const title = computed(() => {
  return props.project.title || props.project.name || 'Proyecto de ley'
})

const description = computed(() => {
  return props.project.description || 'Conocé los puntos principales de esta iniciativa y participá del debate ciudadano.'
})

const formattedPublishedAt = computed(() => {
  if (!props.project.publishedAt) {
    return 'Fecha no disponible'
  }

  return new Date(props.project.publishedAt).toLocaleDateString('es-AR', {
    dateStyle: 'long'
  })
})

const heroLinks = computed(() => ([
  {
    label: 'Explorar más proyectos',
    to: '/proyectos',
    icon: 'lucide:search',
    color: 'neutral' as const,
    variant: 'subtle' as const
  },
  {
    label: 'Participá próximamente',
    icon: 'lucide:megaphone',
    color: 'primary' as const
  }
]))

const heroImage = computed(() => {
  const candidate = props.project.imageUrl || props.project.coverImage

  if (candidate && candidate.trim().length > 0) {
    return candidate
  }

  return 'https://placehold.co/1200x720/0f172a/ffffff?text=Proyecto+de+Ley'
})
</script>

<template>
  <UPageHero
    :headline="project.category || 'Sin categoría'"
    :title="title"
    :description="description"
    :ui="{
      root: 'bg-linear-to-r from-primary/20 via-info/20 to-success/20',
      title: 'text-4xl sm:text-5xl lg:text-6xl'
    }"
  >
    <div class="text-center">   
      <p class="text-sm uppercase tracking-wide text-muted">
        Proyecto presentado por
      </p>
      <p class="font-semibold text-xl">{{ project.authorFullname || 'No informado' }}</p>
    </div>
  </UPageHero>
</template>

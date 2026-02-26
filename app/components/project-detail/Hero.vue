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
    headline="📣 Proyecto de ley publicado"
    :title="title"
    :description="description"
    orientation="horizontal"
    :links="heroLinks"
    :ui="{
      root: 'bg-linear-to-r from-primary/20 via-info/20 to-success/20',
      title: 'text-4xl sm:text-5xl lg:text-6xl'

    }"
  >
    <div class="space-y-3 w-full">
      <div class="relative overflow-hidden rounded-2xl border border-primary/20 bg-muted/30">
        <img
          :src="heroImage"
          alt="Imagen representativa del proyecto"
          class="h-52 md:h-64 w-full object-cover"
          loading="lazy"
        >
        <div class="absolute inset-0 bg-linear-to-t from-black/50 via-black/20 to-transparent" />
        <div class="absolute bottom-3 left-3">
          <UBadge
            color="primary"
            variant="solid"
            size="lg"
          >
            Campaña ciudadana
          </UBadge>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <UPageCard
          variant="outline"
          class="bg-default/60 backdrop-blur"
        >
          <p class="text-xs uppercase tracking-wide text-muted">
            Autor
          </p>
          <p class="font-semibold">
            {{ project.authorFullname || 'No informado' }}
          </p>
        </UPageCard>

        <UPageCard
          variant="outline"
          class="bg-default/60 backdrop-blur"
        >
          <p class="text-xs uppercase tracking-wide text-muted">
            Categoría
          </p>
          <p class="font-semibold">
            {{ project.category || 'Sin categoría' }}
          </p>
        </UPageCard>

        <UPageCard
          variant="outline"
          class="bg-default/60 backdrop-blur"
        >
          <p class="text-xs uppercase tracking-wide text-muted">
            Publicado
          </p>
          <p class="font-semibold">
            {{ formattedPublishedAt }}
          </p>
        </UPageCard>
      </div>
    </div>
  </UPageHero>
</template>

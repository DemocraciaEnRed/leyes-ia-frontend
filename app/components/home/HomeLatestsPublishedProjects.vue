<script setup lang="ts">
interface PublishedProject {
  id: number
  slug: string
  title: string | null
  description: string | null
  category: string | null
  publishedAt: string
  authorFullname: string | null
  owner?: {
    id: number
    fullName: string
    email: string
    imageUrl: string | null
    gravatarUrl: string | null
  }
}

const PLACEHOLDER_COVER_URL = 'https://placehold.co/1200x630?text=Proyecto+de+Ley'

const { data: dataResponse, pending, error } = await useFetch<{ projects: PublishedProject[] }>(
  '/api/backend/hub/projects/latest-published'
)

const projects = computed(() => dataResponse.value?.projects ?? [])

const getAuthors = (project: PublishedProject) => {
  if (!project.authorFullname) {
    return []
  }

  return [{
    name: project.owner?.fullName || project.authorFullname || 'Autor desconocido',
    description: 'Autor del proyecto',
    avatar: {
      alt: project.owner?.fullName || 'Avatar del autor',
      // is imageUrl or gravatarUrl, if both are null, use null
      src: project.owner?.imageUrl || project.owner?.gravatarUrl || undefined
    }
  }]
}
</script>

<template>
  <UPageSection class="">
    <h2 class="text-2xl sm:text-4xl font-title font-bold mb-4">
      Últimos proyectos publicados
    </h2>

    <UProgress
      v-if="pending"
      indeterminate
      class="my-4"
    />

    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      icon="lucide:alert-circle"
      title="No pudimos cargar los proyectos"
      description="Intentá nuevamente en unos minutos."
      class="mb-6"
    />

    <UEmpty
      v-else-if="projects.length === 0"
      icon="lucide:inbox"
      title="Aún no hay proyectos publicados"
      description="Cuando haya publicaciones disponibles, aparecerán acá."
      class="mx-auto"
    />

    <div v-else>
      <UBlogPosts orientation="vertical">
        <UBlogPost
          v-for="project in projects"
          :key="project.id"
          :title="project.title || 'Sin título'"
          :description="project.description || 'Sin descripción disponible.'"
          :badge="{
            label: `${project.category || 'Sin categoría'}`,
            color: 'primary',
            variant: 'soft'
          }"
          :date="project.publishedAt"
          :authors="getAuthors(project)"
          :image="PLACEHOLDER_COVER_URL"
          :to="`/proyectos/${project.slug}`"
          orientation="horizontal"
          variant="subtle"
          :ui="{
            title: 'font-title font-bold',
            body: 'lg:pr-6'
          }"
        />
      </UBlogPosts>

      <div class="flex justify-center mt-8">
        <UButton
          to="/proyectos"
          class="rounded-full"
          size="lg"
          trailing-icon="lucide:arrow-right"
        >
          Todos los proyectos de ley
        </UButton>
      </div>
    </div>
  </UPageSection>
</template>

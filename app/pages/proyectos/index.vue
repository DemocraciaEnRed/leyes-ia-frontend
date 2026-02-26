<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const PLACEHOLDER_COVER_URL = 'https://placehold.co/1200x630?text=Proyecto+de+Ley'

const categorias = [
  'Asuntos Constitucionales',
  'Economía y Hacienda',
  'Educación y Cultura',
  'Salud Pública',
  'Justicia y Derechos Humanos',
  'Seguridad y Defensa',
  'Trabajo y Seguridad Social',
  'Medio Ambiente y Recursos Naturales',
  'Ciencia, Tecnología e Innovación',
  'Relaciones Exteriores',
  'Infraestructura y Transporte',
  'Agricultura, Ganadería y Pesca',
  'Género y Diversidad',
  'Desarrollo Social y Niñez'
]

const categorySelected = computed(() => {
  const rawValue = route.query.category
  const parsed = Number.parseInt(Array.isArray(rawValue) ? rawValue[0] : rawValue, 10)

  if (Number.isNaN(parsed) || parsed < 0 || parsed >= categorias.length) {
    return undefined
  }

  return parsed
})

const queryParams = computed(() => {
  if (categorySelected.value === undefined) {
    return { limit: 5 }
  }

  return {
    category: categorySelected.value
  }
})

const { data: dataResponse, pending, error, refresh } = await useFetch('/api/backend/hub/projects', {
  query: queryParams,
  watch: [categorySelected]
})

const projects = computed(() => dataResponse.value?.projects ?? [])

const getAuthors = (project) => {
  if (!project.authorFullname) {
    return []
  }

  return [{
    name: project.authorFullname,
    description: 'Autor del proyecto',
    avatar: {
      alt: project.authorFullname
    }
  }]
}

const getVariant = (categoryIndex) => {
  if (categorySelected.value !== undefined && categorySelected.value === categoryIndex) {
    return 'solid'
  }

  return 'outline'
}

const toggleCategory = async (categoryIndex) => {
  const nextQuery = { ...route.query }

  if (categorySelected.value === categoryIndex) {
    delete nextQuery.category
  } else {
    nextQuery.category = String(categoryIndex)
  }

  await router.push({
    path: '/proyectos',
    query: nextQuery
  })
}
</script>

<template>
  <NuxtLayout name="default">
    <UPageHero
      title="Proyectos"
      description="Estos son algunos de los proyectos que existen sobre esas temáticas"
    >
      <div>
        <p>Seleccione una categoría:</p>
        <UButton
          v-for="(categoria, index) in categorias"
          :key="index"
          class="m-1"
          :variant="getVariant(index)"
          @click="toggleCategory(index)"
        >
          {{ categoria }}
        </UButton>
      </div>
    </UPageHero>
    <USeparator
      icon="i-lucide-book"
      class="my-8"
    />

    <UContainer>
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
        variant="naked"
        icon="lucide:inbox"
        title="Sin proyectos"
        class="mx-auto"
        description="No se encontraron proyectos en esta categoría."
        :actions="[
          {
            icon: 'lucide:refresh-cw',
            label: 'Refrescar',
            color: 'neutral',
            variant: 'subtle',
            onClick: () => refresh()
          }
        ]"
      />

      <UBlogPosts v-else>
        <UBlogPost
          v-for="project in projects"
          :key="project.id"
          :title="project.title || 'Sin título'"
          :description="project.description || 'Sin descripción disponible.'"
          :badge="project.category || 'Sin categoría'"
          :date="project.publishedAt"
          :authors="getAuthors(project)"
          :image="PLACEHOLDER_COVER_URL"
          :to="`/proyectos/${project.slug}`"
          variant="subtle"
        />
      </UBlogPosts>
    </UContainer>
  </NuxtLayout>
</template>

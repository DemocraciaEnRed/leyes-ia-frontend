<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const PLACEHOLDER_COVER_URL = 'https://placehold.co/1200x630?text=Proyecto+de+Ley'

const categorias = getCategorias()
const categoryDrawerOpen = ref(false)

const categorySelected = computed(() => {
  const rawValue = route.query.categoria
  const parsed = Number.parseInt(Array.isArray(rawValue) ? rawValue[0] : rawValue, 10)

  if (Number.isNaN(parsed) || parsed < 0 || parsed >= categorias.length) {
    return undefined
  }

  return parsed
})

const selectedCategoryLabel = computed(() => {
  if (categorySelected.value === undefined) {
    return undefined
  }

  return categorias[categorySelected.value]
})

const categoryFilterButtonLabel = computed(() => {
  if (selectedCategoryLabel.value) {
    return selectedCategoryLabel.value
  }

  return 'Todas las categorías'
})

const desktopCategory = computed({
  get: () => selectedCategoryLabel.value,
  set: (value) => {
    if (!value) {
      clearCategory()
      return
    }

    const categoryIndex = categorias.indexOf(value)

    if (categoryIndex === -1) {
      return
    }

    toggleCategory(categoryIndex)
  }
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
    delete nextQuery.categoria
  } else {
    nextQuery.categoria = String(categoryIndex)
  }

  await router.push({
    path: '/proyectos',
    query: nextQuery
  })
}

const clearCategory = async () => {
  const nextQuery = { ...route.query }

  delete nextQuery.categoria

  await router.push({
    path: '/proyectos',
    query: nextQuery
  })
}

const selectCategoryFromDrawer = async (categoryIndex) => {
  await toggleCategory(categoryIndex)
  categoryDrawerOpen.value = false
}

const clearCategoryFromDrawer = async () => {
  await clearCategory()
  categoryDrawerOpen.value = false
}
</script>

<template>
  <NuxtLayout name="default">
    <UPageHero
      title="Proyectos"
      :ui="{
        title: 'font-title font-bold',
        container: 'gap-8 sm:gap-y-10 py-12 sm:py-14 lg:pt-18 lg:pb-5'
      }"
    >
      <div class="flex flex-col items-center gap-3 justify-center w-full">
        <p class="font-semibold">
          Seleccioná una categoría
        </p>

        <UDrawer
          v-model:open="categoryDrawerOpen"
          title="Seleccionar categoría"
          description="Elegí una categoría para filtrar los proyectos"
          class="w-full md:hidden"
        >
          <UButton
            :label="categoryFilterButtonLabel"
            color="verdecito"
            variant="outline"
            trailing-icon="i-lucide-chevron-up"
            class="w-full max-w-sm justify-between rounded-full"
          />

          <template #body>
            <div class="flex flex-col gap-2 pb-4">
              <UButton
                label="Todas las categorías"
                color="verdecito"
                :variant="categorySelected === undefined ? 'solid' : 'outline'"
                class="justify-start"
                @click="clearCategoryFromDrawer"
              />
              <UButton
                v-for="(categoria, index) in categorias"
                :key="`drawer-${index}`"
                :label="categoria"
                color="verdecito"
                :variant="getVariant(index)"
                class="justify-start"
                @click="selectCategoryFromDrawer(index)"
              />
            </div>
          </template>
        </UDrawer>

        <div class="hidden md:block w-full max-w-sm">
          <USelect
            v-model="desktopCategory"
            :items="categorias"
            placeholder="Todas las categorías"
            class="w-full"
          />
        </div>

        <div
          v-if="selectedCategoryLabel"
          class="flex items-center gap-2 flex-wrap justify-center"
        >
          <UBadge
            color="verdecito"
            variant="subtle"
            class="rounded-full"
          >
            Filtrando por: {{ selectedCategoryLabel }}
          </UBadge>
          <UButton
            label="Limpiar"
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-lucide-x"
            @click="clearCategory"
          />
        </div>
      </div>
    </UPageHero>
    <USeparator
      icon="i-lucide-book"
      class="my-8"
    />

    <UContainer class="py-10">
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
          :ui="{
            title: 'font-title font-bold',
            description: 'text-sm',
            meta: 'flex-col-reverse items-start'
          }"
          variant="subtle"
        />
      </UBlogPosts>
    </UContainer>
  </NuxtLayout>
</template>

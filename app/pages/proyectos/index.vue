<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const PLACEHOLDER_COVER_URL = 'https://placehold.co/1200x630?text=Proyecto+de+Ley'
const ITEMS_PER_PAGE = 3

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

const currentPage = computed({
  get: () => {
    const rawValue = route.query.page
    const parsed = Number.parseInt(Array.isArray(rawValue) ? rawValue[0] : rawValue, 10)

    if (Number.isNaN(parsed) || parsed < 1) {
      return 1
    }

    return parsed
  },
  set: (nextPage) => {
    const normalizedPage = Number.parseInt(String(nextPage), 10)

    if (Number.isNaN(normalizedPage) || normalizedPage < 1) {
      return
    }

    const nextQuery = { ...route.query }

    if (normalizedPage === 1) {
      delete nextQuery.page
    } else {
      nextQuery.page = String(normalizedPage)
    }

    router.push({
      path: '/proyectos',
      query: nextQuery
    })
  }
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
  const baseParams = {
    limit: ITEMS_PER_PAGE,
    page: currentPage.value
  }

  if (categorySelected.value === undefined) {
    return baseParams
  }

  return {
    ...baseParams,
    category: categorySelected.value
  }
})

const { data: dataResponse, pending, error, refresh } = await useFetch('/api/backend/hub/projects', {
  query: queryParams,
  watch: [categorySelected, currentPage]
})

const projects = computed(() => dataResponse.value?.projects ?? [])
const totalItems = computed(() => {
  if (typeof dataResponse.value?.total === 'number') {
    return dataResponse.value.total
  }

  return projects.value.length
})

const shouldShowPagination = computed(() => {
  return !pending.value && !error.value && totalItems.value > ITEMS_PER_PAGE
})

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

  delete nextQuery.page

  await router.push({
    path: '/proyectos',
    query: nextQuery
  })
}

const clearCategory = async () => {
  const nextQuery = { ...route.query }

  delete nextQuery.categoria
  delete nextQuery.page

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
            variant="outline"
            trailing-icon="i-lucide-chevron-up"
            class="w-full max-w-sm justify-between rounded-full"
          />

          <template #body>
            <div class="flex flex-col gap-2 pb-4">
              <UButton
                label="Todas las categorías"
                :variant="categorySelected === undefined ? 'solid' : 'outline'"
                class="justify-start"
                @click="clearCategoryFromDrawer"
              />
              <UButton
                v-for="(categoria, index) in categorias"
                :key="`drawer-${index}`"
                :label="categoria"
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
          :to="`/proyectos/${project.slug}`"
          :ui="{
            title: 'font-title font-bold',
            description: 'text-sm',
            meta: 'flex-col-reverse items-start'
          }"
          variant="subtle"
        />
      </UBlogPosts>

      <div
        v-if="shouldShowPagination"
        class="mt-8 flex justify-center"
      >
        <UPagination
          v-model:page="currentPage"
          :total="totalItems"
          :items-per-page="ITEMS_PER_PAGE"
          :sibling-count="1"
          show-edges
        />
      </div>
    </UContainer>
  </NuxtLayout>
</template>

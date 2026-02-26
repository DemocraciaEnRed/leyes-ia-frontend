<script setup>
import { computed } from 'vue'

const runtimeConfig = useRuntimeConfig()

definePageMeta({
  layout: 'workspace',
  middleware: 'auth'
})
const route = useRoute()
const projectId = route.params.projectId

const { data: dataResponse, pending, error, refresh } = await useFetch(`/api/backend/projects/${projectId}/manage`)

const projectNotReady = computed(() => {
  return dataResponse.value && (!dataResponse.value.project.title || !dataResponse.value.project.description)
})

const projectNotPublished = computed(() => {
  return dataResponse.value && !dataResponse.value.project.publishedAt
})

function doSomething() {
  console.log('Action button clicked!')
}
</script>

<template>
  <NuxtLayout name="panel-proyecto">
    <UPageHeader
      :title="`${dataResponse?.project.name || 'Cargando...'} `"
      headline="Panel del proyecto"
    />
    <UPageBody>
      <ProjectDashboardStats :project-id="projectId" />
      <UAlert
        v-if="projectNotReady"
        title="Faltan pasos por completar"
        description="Los campos del resumen del proyecto no están completos. Por favor, completa toda la información requerida para publicar el proyecto."
        color="warning"
        variant="subtle"
        icon="lucide:alert-triangle"
      />
      <UAlert
        v-if="projectNotPublished"
        title="Proyecto no publicado"
        description="El proyecto aún no ha sido publicado. Publica el proyecto para que esté disponible para los usuarios."
        color="neutral"
        variant="subtle"
        icon="lucide:info"
      />
    </UPageBody>
  </NuxtLayout>
</template>

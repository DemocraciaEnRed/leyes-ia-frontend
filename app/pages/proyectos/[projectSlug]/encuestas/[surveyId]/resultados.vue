<script setup lang="ts">
const route = useRoute()

const projectSlug = computed(() => {
  const slugParam = route.params.projectSlug
  return Array.isArray(slugParam) ? slugParam[0] : slugParam
})

const surveyId = computed(() => {
  const surveyIdParam = route.params.surveyId
  const parsedSurveyId = Number(Array.isArray(surveyIdParam) ? surveyIdParam[0] : surveyIdParam)

  if (!Number.isInteger(parsedSurveyId) || parsedSurveyId < 1)
    return null

  return parsedSurveyId
})

const projectDetailHref = computed(() => {
  if (!projectSlug.value)
    return '/proyectos'

  return `/proyectos/${projectSlug.value}`
})

const surveyRuntimeHref = computed(() => {
  if (!projectSlug.value || !surveyId.value)
    return '/proyectos'

  return `/proyectos/${projectSlug.value}/encuestas/${surveyId.value}`
})
</script>

<template>
  <NuxtLayout name="encuesta">
    <div class="flex min-h-screen h-screen items-center justify-center bg-accented px-4 pb-6 pt-20 sm:px-6">
      <UPageCard
        variant="outline"
        class="mx-auto w-full max-w-3xl p-8"
        :ui="{ container: 'space-y-4' }"
      >
        <h1 class="text-2xl font-semibold md:text-3xl">
          Resultados de la encuesta
        </h1>
        <p class="text-sm text-muted md:text-base">
          Estamos preparando esta vista para mostrar resultados consolidados de participación.
        </p>

        <div class="flex flex-col gap-2 sm:flex-row">
          <UButton
            color="primary"
            class="w-full justify-center rounded-full"
            :to="surveyRuntimeHref"
          >
            Volver a la encuesta
          </UButton>
          <UButton
            color="neutral"
            variant="subtle"
            class="w-full justify-center rounded-full"
            :to="projectDetailHref"
          >
            Volver al proyecto
          </UButton>
        </div>
      </UPageCard>
    </div>
  </NuxtLayout>
</template>

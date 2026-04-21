<script setup>
definePageMeta({
  layout: 'panel-proyecto'
})
const route = useRoute()
const projectId = route.params.projectId
const surveyId = route.params.surveyId
const toast = useToast()
const actionLoading = ref(false)

const { data: dataResponse, pending, error, refresh } = await useFetch(`/api/backend/projects/${projectId}/manage/surveys/${surveyId}`)

const canBeFeatured = computed(() => {
  const survey = dataResponse.value?.survey

  if (!survey) {
    return false
  }

  if (!survey.public || !survey.visible) {
    return false
  }

  if (!survey.closedAt) {
    return true
  }

  return new Date(survey.closedAt).getTime() > Date.now()
})

const canEdit = computed(() => Boolean(dataResponse.value?.survey?.canEdit))

const setFeaturedSurvey = async () => {
  actionLoading.value = true

  try {
    await $authFetch(`/api/backend/projects/${projectId}/manage/surveys/${surveyId}/featured`, {
      method: 'POST'
    })

    toast.add({
      color: 'success',
      icon: 'lucide:star',
      title: 'Encuesta destacada actualizada',
      description: 'La encuesta ahora es la destacada del proyecto.'
    })

    await refresh()
  } catch (fetchError) {
    toast.add({
      color: 'error',
      icon: 'lucide:alert-circle',
      title: 'No se pudo destacar la encuesta',
      description: fetchError?.data?.error || fetchError?.message || 'Ocurrió un error inesperado.'
    })
  } finally {
    actionLoading.value = false
  }
}

const clearFeaturedSurvey = async () => {
  actionLoading.value = true

  try {
    await $authFetch(`/api/backend/projects/${projectId}/manage/surveys/featured`, {
      method: 'DELETE'
    })

    toast.add({
      color: 'neutral',
      icon: 'lucide:star-off',
      title: 'Encuesta destacada removida',
      description: 'El proyecto ya no tiene encuesta destacada.'
    })

    await refresh()
  } catch (fetchError) {
    toast.add({
      color: 'error',
      icon: 'lucide:alert-circle',
      title: 'No se pudo quitar la destacada',
      description: fetchError?.data?.error || fetchError?.message || 'Ocurrió un error inesperado.'
    })
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
    <UPageHeader
      title="Ver detalles"
      headline="Encuestas"
    />
    <UPageBody>
      <UProgress
        v-if="pending"
        animation="swing"
      />
      <UAlert
        v-if="error"
        title="Error al cargar la encuesta"
        :description="error.message || 'Ocurrió un error inesperado al intentar cargar la encuesta.'"
        color="danger"
        variant="subtle"
        icon="lucide:alert-circle"
      />
      <h1 class="text-2xl font-bold mb-4">
        {{ dataResponse?.survey.title }}
      </h1>
      <p class="text-muted mb-6">
        {{ dataResponse?.survey.about }}
      </p>
      <div class="mb-6 flex flex-wrap gap-2">
        <UBadge
          v-if="dataResponse?.survey.isFeatured"
          color="warning"
          variant="soft"
          icon="lucide:star"
        >
          Encuesta destacada
        </UBadge>
        <UButton
          v-if="!dataResponse?.survey.isFeatured"
          icon="lucide:star"
          color="warning"
          variant="outline"
          :disabled="!canBeFeatured || actionLoading"
          :loading="actionLoading"
          @click="setFeaturedSurvey()"
        >
          Destacar encuesta
        </UButton>
        <UButton
          v-else
          icon="lucide:star-off"
          color="neutral"
          variant="outline"
          :loading="actionLoading"
          @click="clearFeaturedSurvey()"
        >
          Quitar destacada
        </UButton>
        <UButton
          v-if="canEdit"
          icon="lucide:pencil"
          color="primary"
          variant="outline"
          :to="`/proyectos/panel/${projectId}/encuestas/${surveyId}/editar`"
        >
          Editar encuesta
        </UButton>
      </div>
      <USeparator />
      <h2 class="text-xl font-semibold mt-6 mb-4">
        Configuración
      </h2>

      <table class="w-full mb-6 table-auto border-collapse border border-accented text-sm">
        <tbody>
          <tr>
            <td class="border border-accented bg-accented/35 font-semibold p-2">
              ID de la encuesta:
            </td>
            <td class="border border-accented p-2">
              {{ dataResponse?.survey.id }}
            </td>
          </tr>
          <tr>
            <td class="border border-accented bg-accented/35 font-semibold p-2">
              Fecha de creación:
            </td>
            <td class="border border-accented p-2">
              {{ new Date(dataResponse?.survey.createdAt).toLocaleDateString() }} a las {{ new Date(dataResponse?.survey.createdAt).toLocaleTimeString() }}
            </td>
          </tr>
          <!-- closedAt -->
          <tr>
            <td class="border border-accented bg-accented/35 font-semibold p-2">
              Fecha de cierre:
            </td>
            <td
              v-if="dataResponse?.survey.closedAt"
              class="border border-accented p-2"
            >
              {{ new Date(dataResponse?.survey.closedAt).toLocaleDateString() }} a las {{ new Date(dataResponse?.survey.closedAt).toLocaleTimeString() }}
            </td>
            <td
              v-else
              class="border border-accented p-2"
            >
              No establecida
            </td>
          </tr>

          <tr>
            <td class="border border-accented bg-accented/35 font-semibold p-2">
              Número de preguntas:
            </td>
            <td class="border border-accented p-2">
              {{ dataResponse?.survey.questions.length }}
            </td>
          </tr>
          <tr>
            <td class="border border-accented bg-accented/35 font-semibold p-2">
              Número de respuestas:
            </td>
            <td class="border border-accented p-2">
              {{ dataResponse?.survey.responsesCount }}
            </td>
          </tr>
          <tr>
            <td class="border border-accented bg-accented/35 font-semibold p-2">
              Visible para encuestados:
            </td>
            <td class="border border-accented p-2">
              {{ dataResponse?.survey.visible ? 'Sí' : 'No' }}
            </td>
          </tr>
          <tr>
            <td class="border border-accented bg-accented/35 font-semibold p-2">
              Permitir respuestas anónimas:
            </td>
            <td class="border border-accented p-2">
              {{ dataResponse?.survey.allowAnonymousResponses ? 'Sí' : 'No' }}
            </td>
          </tr>
          <tr>
            <td class="border border-accented bg-accented/35 font-semibold p-2">
              Publica
            </td>
            <td class="border border-accented p-2">
              {{ dataResponse?.survey.public ? 'Sí' : 'No' }}
            </td>
          </tr>
          <tr>
            <td class="border border-accented bg-accented/35 font-semibold p-2">
              Tipo de encuesta:
            </td>
            <td class="border border-accented p-2">
              {{ getSurveyType(dataResponse?.survey.type) }}
            </td>
          </tr>
        </tbody>
      </table>
      <USeparator />
      <h2 class="text-xl font-semibold mb-4">
        Instrucciones para generar la encuesta
      </h2>
      <!-- objective               -->
      <h3 class="font-semibold">
        Objetivo de la encuesta
      </h3>
      <div class="px-5 py-2 rounded-md bg-muted/50 ">
        <p>{{ dataResponse?.survey.objective }}</p>
      </div>
      <!-- targetAudience          -->
      <h3 class="font-semibold mb-2">
        Público objetivo de la encuesta
      </h3>
      <div class="px-5 py-2 rounded-md bg-muted/50 ">
        <p>{{ dataResponse?.survey.targetAudience }}</p>
      </div>
      <!-- context                 -->
      <h3 class="font-semibold mb-2">
        Contexto de la encuesta
      </h3>
      <div class="px-5 py-2 rounded-md bg-muted/50 ">
        <p>{{ dataResponse?.survey.context }}</p>
      </div>
      <!-- userInstructions               -->
      <h3 class="font-semibold mb-2">
        Instrucciones para generar las preguntas
      </h3>
      <div class="px-5 py-2 rounded-md bg-muted/50 ">
        <p>{{ dataResponse?.survey.userInstructions }}</p>
      </div>
      <USeparator />
      <h2 class="text-xl font-semibold mb-4">
        Mensaje de bienvenida
      </h2>

      <UPageCard
        variant="outline"
        class=""
      >
        <div class="flex flex-col items-center justify-center text-center space-y-2 min-h-75">
          <p class="text-4xl">
            👋
          </p>
          <h1 class="font-bold text-2xl">
            {{ dataResponse?.survey.welcomeTitle }}
          </h1>
          <p class="text-md text-muted">
            {{ dataResponse?.survey.welcomeDescription }}
          </p>
        </div>
      </UPageCard>
      <USeparator />
      <SurveyQuestionsListCard
        title="Preguntas de la encuesta"
        :questions="dataResponse?.survey.questions || []"
        :can-add="false"
        :can-edit="false"
        :can-reorder="false"
        :can-delete="false"
      />
    </UPageBody>
</template>

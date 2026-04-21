<script setup lang="ts">
interface ProjectSurvey {
  id: number
  title: string
  about: string | null
  createdAt: string
  questions: unknown[]
  responsesCount: number
  type: 'custom' | 'basic'
  public: boolean
  visible: boolean
  closedAt: string | null
  isFeatured?: boolean
  canEdit?: boolean
}

interface SurveyListResponse {
  surveys: ProjectSurvey[]
  featuredSurveyId: number | null
}

definePageMeta({
  layout: 'panel-proyecto',
  middleware: 'auth'
})
const route = useRoute()
const projectId = route.params.projectId
const toast = useToast()

const actionSurveyId = ref<number | null>(null)
const actionType = ref<'set' | 'clear' | null>(null)

const { data: dataResponse, pending, error, refresh } = await useAuthFetch<SurveyListResponse>(`/api/backend/projects/${projectId}/manage/surveys`)

const isSettingFeatured = computed(() => actionType.value === 'set')
const isClearingFeatured = computed(() => actionType.value === 'clear')

const isSurveyAvailableForFeature = (survey: ProjectSurvey) => {
  if (!survey.public || !survey.visible) {
    return false
  }

  if (!survey.closedAt) {
    return true
  }

  return new Date(survey.closedAt).getTime() > Date.now()
}

const setFeaturedSurvey = async (survey: ProjectSurvey) => {
  actionType.value = 'set'
  actionSurveyId.value = survey.id

  try {
    await $authFetch(`/api/backend/projects/${projectId}/manage/surveys/${survey.id}/featured`, {
      method: 'POST'
    })

    toast.add({
      color: 'success',
      icon: 'lucide:star',
      title: 'Encuesta destacada actualizada',
      description: `“${survey.title}” ahora es la encuesta destacada.`
    })

    await refresh()
  } catch (fetchError: any) {
    toast.add({
      color: 'error',
      icon: 'lucide:alert-circle',
      title: 'No se pudo destacar la encuesta',
      description: fetchError?.data?.error || fetchError?.message || 'Ocurrió un error inesperado.'
    })
  } finally {
    actionType.value = null
    actionSurveyId.value = null
  }
}

const clearFeaturedSurvey = async () => {
  actionType.value = 'clear'
  actionSurveyId.value = null

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
  } catch (fetchError: any) {
    toast.add({
      color: 'error',
      icon: 'lucide:alert-circle',
      title: 'No se pudo quitar la destacada',
      description: fetchError?.data?.error || fetchError?.message || 'Ocurrió un error inesperado.'
    })
  } finally {
    actionType.value = null
  }
}

const links = ref([
  {
    label: 'Refrescar',
    icon: 'lucide:refresh-cw',
    onClick: () => refresh()
  },
  {
    label: 'Nueva',
    icon: 'lucide:plus-circle',
    to: `/proyectos/panel/${projectId}/encuestas/nuevo`
  },
  {
    label: 'Crear básica',
    icon: 'lucide:sparkles',
    to: `/proyectos/panel/${projectId}/encuestas/basico`
  },
  {
    label: 'Quitar destacada',
    icon: 'lucide:star-off',
    onClick: () => clearFeaturedSurvey()
  }
])
</script>

<template>
    <UPageHeader
      title="Encuestas"
      headline="Componentes de participación"
      :links="links"
    />
    <UPageBody>
      <UPageCard
        v-for="survey in dataResponse?.surveys"
        :key="survey.id"
        variant="subtle"
      >
        <div class="flex flex-col md:flex-row md:justify-between md:items-start">
          <div class="mr-3 w-10/12 space-y-2">
            <h2 class="text-xl font-semibold">
              {{ survey.title }}
            </h2>
            <div
              v-if="survey.isFeatured"
              class="inline-flex"
            >
              <UBadge
                color="warning"
                variant="soft"
                icon="lucide:star"
              >
                Encuesta destacada
              </UBadge>
            </div>
            <p class="text-sm text-muted">
              {{ survey.about }}
            </p>
            <p class="text-xs text-muted">
              Creada el {{ new Date(survey.createdAt).toLocaleDateString() }} a las {{ new Date(survey.createdAt).toLocaleTimeString() }}
            </p>
            <USeparator />
            <div class="flex items-center gap-2">
              <UFieldGroup>
                <UBadge
                  color="neutral"
                  variant="outline"
                  class="capitalize"
                >
                  Preguntas
                </UBadge>
                <UBadge
                  color="neutral"
                  variant="subtle"
                  class="capitalize"
                >
                  {{ survey.questions.length }}
                </UBadge>
              </UFieldGroup>
              <UFieldGroup>
                <UBadge
                  color="neutral"
                  variant="outline"
                  class="capitalize"
                >
                  Respuestas
                </UBadge>
                <UBadge
                  color="neutral"
                  variant="subtle"
                  class="capitalize"
                >
                  {{ survey.responsesCount }}
                </UBadge>
              </UFieldGroup>
              <UFieldGroup>
                <UBadge
                  color="neutral"
                  variant="outline"
                  class="capitalize"
                >
                  Tipo
                </UBadge>
                <UBadge
                  color="neutral"
                  variant="subtle"
                  class="capitalize"
                >
                  {{ getSurveyType(survey.type) }}
                </UBadge>
              </UFieldGroup>
              <UFieldGroup>
                <UBadge
                  color="neutral"
                  variant="outline"
                  class="capitalize"
                >
                  Publica
                </UBadge>
                <UBadge
                  color="neutral"
                  variant="subtle"
                  class="capitalize"
                >
                  {{ getBooleanTranslation(survey.public) }}
                </UBadge>
              </UFieldGroup>
              <UFieldGroup>
                <UBadge
                  color="neutral"
                  variant="outline"
                  class="capitalize"
                >
                  Visible
                </UBadge>
                <UBadge
                  color="neutral"
                  variant="subtle"
                  class="capitalize"
                >
                  {{ getBooleanTranslation(survey.visible) }}
                </UBadge>
              </UFieldGroup>
            </div>
          </div>
          <div class="flex flex-col gap-2 min-w-52">
            <UButton
              :to="`/proyectos/panel/${projectId}/encuestas/${survey.id}`"
              variant="subtle"
              color="neutral"
              trailing-icon="lucide:arrow-right"
            >
              Ver detalles
            </UButton>
            <UButton
              v-if="survey.canEdit"
              :to="`/proyectos/panel/${projectId}/encuestas/${survey.id}/editar`"
              variant="outline"
              color="primary"
              icon="lucide:pencil"
            >
              Editar
            </UButton>
            <UButton
              v-if="!survey.isFeatured"
              icon="lucide:star"
              color="warning"
              variant="outline"
              :disabled="!isSurveyAvailableForFeature(survey)"
              :loading="isSettingFeatured && actionSurveyId === survey.id"
              @click="setFeaturedSurvey(survey)"
            >
              Destacar encuesta
            </UButton>
            <UButton
              v-else
              icon="lucide:star-off"
              color="neutral"
              variant="outline"
              :loading="isClearingFeatured"
              @click="clearFeaturedSurvey()"
            >
              Quitar destacada
            </UButton>
          </div>
        </div>
      </UPageCard>
    </UPageBody>
</template>

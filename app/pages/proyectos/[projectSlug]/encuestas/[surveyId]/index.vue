<script setup lang="ts">
import ConfirmActionModal from '~/components/ConfirmActionModal.vue'
import ProfileCompletionModal from '~/components/survey/ProfileCompletionModal.vue'

const overlay = useOverlay()
const leaveSurveyModal = overlay.create(ConfirmActionModal)
const profileCompletionModal = overlay.create(ProfileCompletionModal)
const route = useRoute()
const toast = useToast()
const { user, loggedIn, refreshSession } = useAuth()

type PublicSurveyQuestion = {
  id?: number | string
  questionText?: string
  type?: string
  required?: boolean
  helpText?: string
  options?: string[]
  openTextEnabled?: boolean
  scale?: number
  maxLength?: number
}

type SurveyAnswerValue = {
  value: string | string[] | number | null
  openText?: string
}

type PublicSurvey = {
  id: number
  projectId: number
  title: string
  welcomeTitle?: string | null
  welcomeDescription?: string | null
  allowAnonymousResponses: boolean
  questions: PublicSurveyQuestion[]
}

type PublicSurveyResponse = {
  survey: PublicSurvey
}

type SurveyEligibilityResponse = {
  projectId: number
  surveyId: number
  mode: 'authenticated' | 'anonymous'
  eligible: boolean
  hasResponded?: boolean
  code?: string
  allowAnonymousResponses: boolean
  requiredFields: string[]
  missingFields: string[]
  message: string
}

type SurveyRuntimeData = {
  survey: PublicSurvey
  eligibility: SurveyEligibilityResponse
}

type ProvinceResponse = {
  provinces: Array<{ id: number, code: string, name: string }>
}

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
    return ''

  return `/proyectos/${projectSlug.value}`
})

const surveyResultsHref = computed(() => {
  if (!projectSlug.value || !surveyId.value)
    return ''

  return `/proyectos/${projectSlug.value}/encuestas/${surveyId.value}/resultados`
})

const { data: provincesResponse } = await useFetch<ProvinceResponse>('/api/backend/utils/provinces')

const provinceOptions = computed(() => {
  return (provincesResponse.value?.provinces || []).map(province => ({
    label: province.name,
    value: province.id
  }))
})

const {
  data: runtimeData,
  pending: isLoadingRuntime,
  error: runtimeFetchError,
  refresh: refreshRuntime
} = await useAsyncData<SurveyRuntimeData | null>(
  () => `survey-runtime:${projectSlug.value || 'unknown'}:${surveyId.value || 'unknown'}`,
  async () => {
    if (!projectSlug.value || !surveyId.value)
      return null

    const [surveyResponse, eligibilityResponse] = await Promise.all([
      $fetch<PublicSurveyResponse>(`/api/backend/hub/projects/slug/${projectSlug.value}/surveys/${surveyId.value}`),
      $fetch<SurveyEligibilityResponse>(`/api/backend/hub/projects/slug/${projectSlug.value}/surveys/${surveyId.value}/respondent-eligibility`)
    ])

    return {
      survey: surveyResponse.survey,
      eligibility: eligibilityResponse
    }
  },
  {
    watch: [projectSlug, surveyId],
    default: () => null
  }
)

const runtimeError = computed<string | null>(() => {
  const normalizedError = runtimeFetchError.value as { data?: { error?: string, message?: string }, message?: string } | null

  if (!normalizedError)
    return null

  return normalizedError?.data?.error || normalizedError?.data?.message || normalizedError?.message || 'No se pudo cargar la encuesta.'
})

const surveyData = computed<PublicSurvey | null>(() => runtimeData.value?.survey || null)
const eligibilityData = computed<SurveyEligibilityResponse | null>(() => runtimeData.value?.eligibility || null)
const hasOpenedProfileModal = ref(false)
const submittingProfile = ref(false)
const anonymousProfileReady = ref(false)

const anonymousRespondentData = reactive({
  dateOfBirth: '',
  genre: '',
  documentNumber: '',
  provinceId: undefined as number | undefined
})

const canContinueAnonymous = computed(() => {
  return Boolean(
    anonymousRespondentData.dateOfBirth
      && anonymousRespondentData.genre
      && anonymousRespondentData.documentNumber
      && anonymousRespondentData.provinceId,
  )
})

const normalizedQuestions = computed(() => {
  return (surveyData.value?.questions || []).map((question, index) => ({
    id: Number(question.id) || index + 1,
    questionText: question.questionText || `Pregunta ${index + 1}`,
    type: question.type,
    required: Boolean(question.required),
    helpText: question.helpText,
    options: Array.isArray(question.options) ? question.options : [],
    openTextEnabled: Boolean(question.openTextEnabled),
    scale: typeof question.scale === 'number' ? question.scale : undefined,
    maxLength: typeof question.maxLength === 'number' ? question.maxLength : undefined
  }))
})

const shouldShowAnonymousGate = computed(() => {
  return eligibilityData.value?.mode === 'anonymous' && eligibilityData.value.eligible
})

const shouldShowLoggedProfileGate = computed(() => {
  return eligibilityData.value?.mode === 'authenticated'
    && !eligibilityData.value.eligible
    && !eligibilityData.value.hasResponded
    && eligibilityData.value.code !== 'ALREADY_RESPONDED'
})

const shouldShowAlreadyAnsweredState = computed(() => {
  return eligibilityData.value?.mode === 'authenticated'
    && !eligibilityData.value.eligible
    && (eligibilityData.value.hasResponded || eligibilityData.value.code === 'ALREADY_RESPONDED')
})

const isSurveyReady = computed(() => {
  if (!surveyData.value || !eligibilityData.value)
    return false

  if (shouldShowLoggedProfileGate.value)
    return false

  if (shouldShowAnonymousGate.value && !anonymousProfileReady.value)
    return false

  return true
})

const loadRuntime = async () => {
  await refreshRuntime()

  if (eligibilityData.value?.mode === 'anonymous') {
    anonymousProfileReady.value = false
  }
}

const saveProfileAndRefreshEligibility = async (payload: {
  dateOfBirth: string
  genre: string
  documentNumber: string
  provinceId: number
}) => {
  try {
    submittingProfile.value = true

    await $authFetch('/api/backend/users/me/profile', {
      method: 'PATCH',
      body: payload
    })

    try {
      await $fetch('/api/auth/refresh-token', {
        method: 'POST'
      })
    } catch (error: unknown) {
      void error
    }

    await refreshSession()
    await loadRuntime()

    toast.add({
      title: 'Perfil actualizado',
      description: 'Ya puedes continuar con la encuesta.',
      color: 'success'
    })
  } finally {
    submittingProfile.value = false
  }
}

const openProfileGateModal = async () => {
  if (!loggedIn.value)
    return

  const instance = profileCompletionModal.open({
    initialData: {
      dateOfBirth: user.value?.dateOfBirth || null,
      genre: user.value?.genre || null,
      documentNumber: user.value?.documentNumber || null,
      provinceId: user.value?.provinceId || null
    },
    provinceOptions: provinceOptions.value
  })

  const payload = await instance.result
  if (!payload)
    return

  try {
    await saveProfileAndRefreshEligibility(payload)
  } catch (error: unknown) {
    const normalizedError = error as { data?: { message?: string }, message?: string }
    toast.add({
      title: 'No se pudo guardar el perfil',
      description: normalizedError?.data?.message || normalizedError?.message || 'Inténtalo nuevamente.',
      color: 'error'
    })
  }
}

const submitSurvey = async (answers: Record<number, SurveyAnswerValue>) => {
  if (!surveyData.value)
    throw new Error('No se pudo obtener la encuesta')

  const normalizedAnswers: Array<{
    questionIndex: number
    value: string | string[] | number | null
    openText?: string
  }> = []

  for (const [questionIndex, question] of normalizedQuestions.value.entries()) {
    const answer = answers[question.id]

    if (!answer || answer.value === null || answer.value === undefined) {
      continue
    }

    if (typeof answer.value === 'string' && !answer.value.trim()) {
      continue
    }

    if (Array.isArray(answer.value) && answer.value.length === 0) {
      continue
    }

    normalizedAnswers.push({
      questionIndex,
      value: answer.value,
      openText: answer?.openText || undefined
    })
  }

  normalizedAnswers.sort((a, b) => a.questionIndex - b.questionIndex)

  const payload: Record<string, unknown> = {
    answers: normalizedAnswers
  }

  if (eligibilityData.value?.mode === 'anonymous') {
    payload.dateOfBirth = anonymousRespondentData.dateOfBirth
    payload.genre = anonymousRespondentData.genre
    payload.documentNumber = anonymousRespondentData.documentNumber
    payload.provinceId = anonymousRespondentData.provinceId
  }

  await $fetch(`/api/backend/projects/${surveyData.value.projectId}/surveys/${surveyData.value.id}/responses`, {
    method: 'POST',
    body: payload
  })
}

watch(() => shouldShowLoggedProfileGate.value, async (shouldOpenModal) => {
  if (import.meta.server)
    return

  if (!shouldOpenModal || hasOpenedProfileModal.value || submittingProfile.value)
    return

  hasOpenedProfileModal.value = true
  await openProfileGateModal()
})

watch(() => eligibilityData.value?.mode, (mode) => {
  if (mode === 'authenticated') {
    hasOpenedProfileModal.value = false
  }

  if (mode === 'anonymous') {
    anonymousProfileReady.value = false
  }
})

const handleLogoClick = async () => {
  const instance = leaveSurveyModal.open({
    question: '¿Salir de la encuesta?',
    bodyText: 'Estás a punto de abandonar la encuesta. Si salís ahora, podrías perder el progreso no enviado.',
    acceptLabel: 'Salir',
    cancelLabel: 'Continuar encuesta'
  })

  const confirmed = await instance.result

  if (confirmed) {
    await navigateTo(`/proyectos/${projectSlug.value}`)
  }
}
</script>

<template>
  <NuxtLayout name="encuesta">
    <button
      type="button"
      class="absolute left-4 top-0 cursor-pointer"
      @click="handleLogoClick"
    >
      <AppLogo class="h-16" />
    </button>
    <UColorModeButton
      variant="solid"
      size="xs"
      color="neutral"
      class="absolute right-4 top-4 cursor-pointer"
    >
      <template #icon>
        <UIcon name="lucide:moon" />
      </template>
    </UColorModeButton>

    <div
      v-if="isLoadingRuntime"
      class="flex min-h-screen h-screen items-center justify-center bg-accented px-4 pb-6 pt-20 sm:px-6"
    >
      <UPageCard
        variant="outline"
        class="mx-auto w-full max-w-3xl p-8"
      >
        <p class="text-sm text-muted">
          Cargando encuesta...
        </p>
      </UPageCard>
    </div>

    <div
      v-else-if="runtimeError"
      class="flex min-h-screen h-screen items-center justify-center bg-accented px-4 pb-6 pt-20 sm:px-6"
    >
      <UPageCard
        variant="outline"
        class="mx-auto w-full max-w-3xl p-8"
      >
        <UAlert
          color="error"
          variant="soft"
          icon="lucide:circle-alert"
          title="No se pudo cargar la encuesta"
          :description="runtimeError"
        />
      </UPageCard>
    </div>

    <div
      v-else-if="shouldShowLoggedProfileGate"
      class="flex min-h-screen h-screen items-center justify-center bg-accented px-4 pb-6 pt-20 sm:px-6"
    >
      <UPageCard
        variant="outline"
        class="mx-auto w-full max-w-3xl p-8"
        :ui="{ container: 'space-y-4' }"
      >
        <UAlert
          color="warning"
          variant="soft"
          icon="lucide:triangle-alert"
          title="Completa tu perfil para continuar"
          :description="eligibilityData?.message"
        />
        <UButton
          color="primary"
          :loading="submittingProfile"
          @click="openProfileGateModal"
        >
          Completar datos
        </UButton>
      </UPageCard>
    </div>

    <div
      v-else-if="shouldShowAlreadyAnsweredState"
      class="flex min-h-screen h-screen items-center justify-center bg-accented px-4 pb-6 pt-20 sm:px-6"
    >
      <UPageCard
        variant="outline"
        class="mx-auto w-full max-w-3xl p-8"
        :ui="{ container: 'space-y-4' }"
      >
        <UAlert
          color="success"
          variant="soft"
          icon="lucide:check-circle-2"
          title="Ya participaste en esta encuesta"
          :description="eligibilityData?.message || 'Tu respuesta ya fue registrada.'"
        />
        <UButton
          variant="subtle"
          :ui="{
            base: 'justify-center rounded-full'
          }"
          @click="navigateTo(`/proyectos/${projectSlug}`)"
        >
          Volver al proyecto
        </UButton>
      </UPageCard>
    </div>

    <div
      v-else-if="eligibilityData?.mode === 'anonymous' && !eligibilityData.eligible"
      class="flex min-h-screen h-screen items-center justify-center bg-accented px-4 pb-6 pt-20 sm:px-6"
    >
      <UPageCard
        variant="outline"
        class="mx-auto w-full max-w-3xl p-8"
        :ui="{ container: 'space-y-4' }"
      >
        <UAlert
          color="warning"
          variant="soft"
          icon="lucide:shield-alert"
          title="Esta encuesta requiere inicio de sesión"
          :description="eligibilityData.message"
        />
        <UButton
          color="primary"
          to="/auth/login"
        >
          Iniciar sesión
        </UButton>
      </UPageCard>
    </div>

    <div
      v-else-if="shouldShowAnonymousGate && !anonymousProfileReady"
      class="flex min-h-screen h-screen items-center justify-center bg-accented px-4 pb-6 pt-20 sm:px-6"
    >
      <UPageCard
        variant="outline"
        class="mx-auto w-full max-w-3xl p-8"
        :ui="{ container: 'space-y-4' }"
      >
        <h1 class="text-2xl font-semibold md:text-3xl">
          Completa tus datos para comenzar
        </h1>

        <UFormField
          label="Fecha de nacimiento"
          name="anonymousDateOfBirth"
        >
          <UInput
            v-model="anonymousRespondentData.dateOfBirth"
            type="date"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Género"
          name="anonymousGenre"
        >
          <USelect
            v-model="anonymousRespondentData.genre"
            class="w-full"
            :items="[
              { label: 'Masculino', value: 'masculino' },
              { label: 'Femenino', value: 'femenino' },
              { label: 'No binario', value: 'no_binario' },
              { label: 'Otro', value: 'otro' },
              { label: 'Prefiero no decirlo', value: 'prefiero_no_decir' }
            ]"
            placeholder="Seleccioná una opción"
          />
        </UFormField>

        <UFormField
          label="Número de documento"
          name="anonymousDocumentNumber"
          help="Este dato se usa para evitar respuestas duplicadas. Se almacena de forma interna y no se comparte con el legislador."
        >
          <UInput
            v-model="anonymousRespondentData.documentNumber"
            class="w-full"
            placeholder="Solo números"
            inputmode="numeric"
          />
        </UFormField>

        <UFormField
          label="Provincia"
          name="anonymousProvince"
        >
          <USelect
            v-model="anonymousRespondentData.provinceId"
            class="w-full"
            :items="provinceOptions"
            placeholder="Seleccioná una provincia"
          />
        </UFormField>

        <UButton
          color="primary"
          :disabled="!canContinueAnonymous"
          @click="anonymousProfileReady = true"
        >
          Continuar a la encuesta
        </UButton>
      </UPageCard>
    </div>

    <SurveyWrapper
      v-else-if="isSurveyReady"
      :questions="normalizedQuestions"
      :welcome-title="surveyData?.welcomeTitle || surveyData?.title"
      :welcome-description="surveyData?.welcomeDescription || undefined"
      :completion-results-href="surveyResultsHref"
      :completion-project-href="projectDetailHref"
      :submit-action="submitSurvey"
    />
  </NuxtLayout>
</template>

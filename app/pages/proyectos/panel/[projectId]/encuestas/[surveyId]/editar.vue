<script setup lang="ts">
import ConfirmActionModal from '~/components/ConfirmActionModal.vue'
import { CalendarDate, Time } from '@internationalized/date'

definePageMeta({
  layout: 'panel-proyecto',
  middleware: 'auth'
})
const toast = useToast()
const route = useRoute()
const projectId = route.params.projectId
const surveyId = route.params.surveyId

type SurveyQuestion = {
  questionText?: string
  type?: string
  required?: boolean
  helpText?: string
  options?: string[]
  scale?: number
  maxLength?: number
  openTextEnabled?: boolean
}

type SurveyDetailResponse = {
  survey?: {
    title?: string
    about?: string
    welcomeTitle?: string
    welcomeDescription?: string
    public?: boolean
    visible?: boolean
    allowAnonymousResponses?: boolean
    questions?: SurveyQuestion[]
    surveyJsonSchema?: Record<string, unknown> | null
    closedAt?: string | null
    canEdit?: boolean
  }
}

const inputDate = useTemplateRef('inputDate')
const savingSurvey = ref(false)
const editingQuestionIndex = ref<number | null>(null)

const now = new Date()
const minDate = shallowRef(new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate() + 1))

const surveyClosedAt = shallowRef(new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate() + 1))
const surveyClosedAtTime = shallowRef(new Time(20, 0))

const surveyTitle = ref('')
const surveyAbout = ref('')
const surveyWelcomeTitle = ref('')
const surveyWelcomeSubtitle = ref('')
const surveyPublic = ref(true)
const surveyVisible = ref(true)
const surveyAllowAnonymousResponses = ref(false)
const survey = reactive({
  questions: [] as SurveyQuestion[],
  surveyJsonSchema: {} as Record<string, unknown> | null
})

const { data: dataResponse, pending, error, refresh } = await useAuthFetch<SurveyDetailResponse>(`/api/backend/projects/${projectId}/manage/surveys/${surveyId}`)

const canEdit = computed(() => Boolean(dataResponse.value?.survey?.canEdit))

const syncSurveyForm = () => {
  const source = dataResponse.value?.survey

  if (!source) {
    return
  }

  surveyTitle.value = source.title || ''
  surveyAbout.value = source.about || ''
  surveyWelcomeTitle.value = source.welcomeTitle || ''
  surveyWelcomeSubtitle.value = source.welcomeDescription || ''
  surveyPublic.value = Boolean(source.public)
  surveyVisible.value = Boolean(source.visible)
  surveyAllowAnonymousResponses.value = Boolean(source.allowAnonymousResponses)
  survey.questions = Array.isArray(source.questions) ? source.questions : []
  survey.surveyJsonSchema = source.surveyJsonSchema || null

  const closedAtDate = source.closedAt ? new Date(source.closedAt) : null
  if (closedAtDate && !Number.isNaN(closedAtDate.getTime())) {
    surveyClosedAt.value = new CalendarDate(closedAtDate.getFullYear(), closedAtDate.getMonth() + 1, closedAtDate.getDate())
    surveyClosedAtTime.value = new Time(closedAtDate.getHours(), closedAtDate.getMinutes())
  }
}

watch(() => dataResponse.value?.survey, syncSurveyForm, { immediate: true })

const addQuestion = () => {
  const newQuestion = {
    questionText: '',
    type: 'single-choice',
    required: false,
    openTextEnabled: true,
    options: ['Sí', 'No', 'No sé']
  }

  survey.questions.push(newQuestion)
  editingQuestionIndex.value = survey.questions.length - 1
}

const editQuestion = (index: number) => {
  editingQuestionIndex.value = index
}

const saveQuestionEdit = (index: number, payload: SurveyQuestion) => {
  survey.questions[index] = {
    ...survey.questions[index],
    ...payload
  }

  editingQuestionIndex.value = null
}

const cancelQuestionEdit = () => {
  editingQuestionIndex.value = null
}

const deleteQuestion = async (index: number) => {
  const questionText = survey.questions?.[index]?.questionText || 'esta pregunta'

  const instance = confirmDeleteModal.open({
    question: 'Eliminar pregunta',
    bodyText: `¿Querés eliminar "${questionText}"? Esta acción no se puede deshacer.`,
    acceptLabel: 'Eliminar',
    cancelLabel: 'Cancelar'
  })

  const confirmed = await instance.result

  if (confirmed) {
    survey.questions.splice(index, 1)
    if (editingQuestionIndex.value === index) {
      editingQuestionIndex.value = null
    }
  }
}

const moveQuestionUp = (index: number) => {
  if (index > 0) {
    const questions = survey.questions
    const previousQuestion = questions[index - 1]
    const currentQuestion = questions[index]

    if (!previousQuestion || !currentQuestion) {
      return
    }

    questions[index - 1] = currentQuestion
    questions[index] = previousQuestion
  }
}

const moveQuestionDown = (index: number) => {
  const questions = survey.questions
  if (index < questions.length - 1) {
    const currentQuestion = questions[index]
    const nextQuestion = questions[index + 1]

    if (!currentQuestion || !nextQuestion) {
      return
    }

    questions[index] = nextQuestion
    questions[index + 1] = currentQuestion
  }
}

const saveSurvey = async () => {
  if (!canEdit.value) {
    return
  }

  savingSurvey.value = true

  const getErrorMessage = (fetchError: unknown) => {
    if (!fetchError || typeof fetchError !== 'object') {
      return 'Ocurrió un error inesperado.'
    }

    const maybeError = fetchError as {
      data?: { error?: string }
      message?: string
    }

    return maybeError.data?.error || maybeError.message || 'Ocurrió un error inesperado.'
  }

  try {
    await $authFetch(`/api/backend/projects/${projectId}/manage/surveys/${surveyId}`, {
      method: 'PATCH',
      body: {
        surveyTitle: surveyTitle.value,
        surveyAbout: surveyAbout.value,
        surveyPublic: surveyPublic.value,
        surveyVisible: surveyVisible.value,
        allowAnonymousResponses: surveyAllowAnonymousResponses.value,
        surveyWelcomeTitle: surveyWelcomeTitle.value,
        surveyWelcomeSubtitle: surveyWelcomeSubtitle.value,
        surveyClosedAt: new Date(`${surveyClosedAt.value.toString()}T${surveyClosedAtTime.value.toString()}`).toISOString(),
        questions: survey.questions,
        surveyJsonSchema: survey.surveyJsonSchema
      }
    })

    toast.add({
      title: 'Encuesta actualizada',
      description: 'Los cambios se guardaron exitosamente.',
      color: 'success'
    })

    await refresh()
    navigateTo(`/proyectos/panel/${projectId}/encuestas/${surveyId}`)
  } catch (fetchError: unknown) {
    toast.add({
      title: 'No se pudo actualizar la encuesta',
      description: getErrorMessage(fetchError),
      color: 'error'
    })
  } finally {
    savingSurvey.value = false
  }
}
</script>

<template>
    <UPageHeader
      title="Editar encuesta"
      headline="Encuestas"
      description="Podés editar la encuesta solo mientras no esté activa."
    />

    <UPageBody>
      <UProgress
        v-if="pending"
        animation="swing"
      />

      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="lucide:alert-circle"
        title="No se pudo cargar la encuesta"
        :description="error.message || 'Ocurrió un error inesperado.'"
      />

      <UAlert
        v-if="!pending && !error && !canEdit"
        color="warning"
        variant="subtle"
        icon="lucide:lock"
        title="Encuesta activa"
        description="Esta encuesta está activa y no se puede editar."
      />

      <UPageCard
        variant="subtle"
        title="1. Datos básicos"
      >
        <UFormField label="Título de la encuesta">
          <UInput
            v-model="surveyTitle"
            placeholder="Escribe el título de la encuesta aquí"
            class="w-full"
            :disabled="!canEdit"
          />
        </UFormField>

        <UFormField label="Descripción de la encuesta">
          <UTextarea
            v-model="surveyAbout"
            placeholder="Escribe una breve descripción de la encuesta aquí"
            class="w-full"
            :disabled="!canEdit"
          />
        </UFormField>

        <USwitch
          v-model="surveyPublic"
          label="Pública"
          :disabled="!canEdit"
        />

        <USwitch
          v-model="surveyAllowAnonymousResponses"
          label="Permitir respuestas anónimas"
          :disabled="!canEdit"
        />

        <USwitch
          v-model="surveyVisible"
          label="Publicar inmediatamente"
          :disabled="!canEdit"
        />

        <UFormField label="Fecha de cierre">
          <UInputDate
            ref="inputDate"
            v-model="surveyClosedAt"
            :disabled="!canEdit"
          >
            <template #trailing>
              <UPopover :reference="inputDate?.inputsRef[3]?.$el">
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="i-lucide-calendar"
                  aria-label="Select a date"
                  class="px-0"
                  :disabled="!canEdit"
                />

                <template #content>
                  <UCalendar
                    v-model="surveyClosedAt"
                    class="p-2"
                    :min-value="minDate"
                  />
                </template>
              </UPopover>
            </template>
          </UInputDate>
          <UInputTime
            v-model="surveyClosedAtTime"
            :disabled="!canEdit"
          />
        </UFormField>
      </UPageCard>

      <UPageCard
        variant="subtle"
        title="2. Configurar mensaje de bienvenida"
      >
        <UFormField label="Mensaje de bienvenida para los encuestados">
          <UInput
            v-model="surveyWelcomeTitle"
            placeholder="Escribe el mensaje de bienvenida para los encuestados aquí"
            class="w-full"
            :disabled="!canEdit"
          />
        </UFormField>

        <UFormField label="Subtítulo o instrucciones iniciales para los encuestados">
          <UTextarea
            v-model="surveyWelcomeSubtitle"
            placeholder="Escribe el subtítulo o instrucciones iniciales para los encuestados aquí"
            class="w-full"
            :disabled="!canEdit"
          />
        </UFormField>
      </UPageCard>

      <SurveyQuestionsListCard
        title="3. Preguntas"
        description="Editá, reordená o agregá preguntas antes de guardar cambios."
        :questions="survey.questions"
        :editing-index="editingQuestionIndex"
        :can-add="canEdit"
        :can-edit="canEdit"
        :can-reorder="canEdit"
        :can-delete="canEdit"
        :action-disabled="!canEdit || savingSurvey"
        @add="addQuestion"
        @edit="editQuestion"
        @save="saveQuestionEdit"
        @cancel="cancelQuestionEdit"
        @move-up="moveQuestionUp"
        @move-down="moveQuestionDown"
        @delete="deleteQuestion"
      />

      <UButton
        color="primary"
        icon="lucide:save"
        :loading="savingSurvey"
        :disabled="!canEdit"
        class="w-full justify-center cursor-pointer mt-5"
        @click="saveSurvey"
      >
        Guardar cambios
      </UButton>
    </UPageBody>
</template>

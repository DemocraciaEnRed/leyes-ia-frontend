<script setup>
import { CalendarDate, Time } from '@internationalized/date'

definePageMeta({
  middleware: 'auth'
})

const toast = useToast()
const route = useRoute()
const projectId = route.params.projectId

// State for AI content generation
const generatingContent = ref(false)
const savingSurvey = ref(false)
const alreadyContentGenerated = ref(false)

const inputDate = useTemplateRef('inputDate')

const now = new Date()
// monthLater should be a date from now to 7 days later
const monthLater = new Date()
monthLater.setDate(now.getDate() + 7)
const minDate = shallowRef(new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate() + 1))

const surveyClosedAt = shallowRef(new CalendarDate(monthLater.getFullYear(), monthLater.getMonth() + 1, monthLater.getDate()))
// make it at 20:00
const surveyClosedAtTime = shallowRef(new Time(20, 0))

const surveyTitle = ref('')
const surveyAbout = ref('')
const surveyWelcomeTitle = ref('¡Hola! Queremos conocer tu opinión sobre este proyecto de ley.')
const surveyWelcomeSubtitle = ref('Tu participación es muy valiosa para nosotros. La encuesta no te llevará más de 5 minutos y tus respuestas serán anónimas.')
const surveyPublic = ref(true)
const surveyType = 'basic'
const surveyVisible = ref(true)
const surveyAllowAnonymousResponses = ref(false)
const survey = reactive({
  questions: [],
  surveyJsonSchema: {}
})
const editingQuestionIndex = ref(null)

const generateContentWithAI = async () => {
  generatingContent.value = true
  try {
    // Call your AI service here with the provided inputs
    const response = await $fetch(`/api/backend/projects/${projectId}/manage/surveys/generate-base`, {
      method: 'POST',
      body: {
        projectId: projectId
      }
    })

    if (response && response.survey) {
      // This is the survey schema
      // Survey Schema (Min 5 questions, Max 10 questions)
      // Each question should have:
      // - questionText: string
      // - type: enum (multiple-choice, open-ended, rating)
      // - options: array of strings (only for multiple-choice)
      // - required: boolean
      // - helpText: string (optional)
      // - maxLength: number (only for open-ended)
      // - scale: number (only for rating, e.g., 5 for a 1-5 scale)
      // const surveyStructure = z.object({
      //     title: z.string().describe('Título de la encuesta. Es para uso interno, no es visible para los encuestados.'),
      //     about: z.string().describe('Descripción interna de la encuesta, para uso del equipo, no es visible para los encuestados.'),
      //     welcomeTitle: z.string().describe('Título de bienvenida para los encuestados, que se muestra al inicio de la encuesta.'),
      //     welcomeDescription: z.string().describe('Descripción de bienvenida que proporciona contexto e instrucciones a los encuestados al inicio de la encuesta.'),
      //     questions: z.array(z.object({
      //         questionText: z.string().describe('El texto de la pregunta a incluir en la encuesta. Nota: No siempre debe ser en formato de pregunta, puede ser una instrucción o una solicitud de feedback.'),
      //         type: z.enum(['multiple-choice', 'open-ended', 'rating']).describe('El tipo de pregunta: opción múltiple, abierta o de calificación.'),
      //         options: z.array(z.string()).optional().describe('Las opciones disponibles para preguntas de opción múltiple, si aplica.'),
      //         required: z.boolean().describe('Indica si la pregunta es obligatoria.'),
      //         helpText: z.string().optional().describe('Texto de ayuda adicional para la pregunta, si es necesario.'),
      //         maxLength: z.number().optional().describe('La longitud máxima permitida para respuestas abiertas, si aplica.'),
      //         scale: z.number().optional().describe('La escala de calificación para preguntas de calificación, si aplica.'),
      //     })).min(5).max(10) // limit to 10 questions
      // });

      // Validate and set the generated content
      survey.questions = response.survey.questions || []
      survey.surveyJsonSchema = response.survey.surveyJsonSchema || {}
      surveyTitle.value = response.survey.title || ''
      surveyAbout.value = response.survey.about || ''
      surveyWelcomeTitle.value = response.survey.welcomeTitle || surveyWelcomeTitle.value
      surveyWelcomeSubtitle.value = response.survey.welcomeSubtitle || surveyWelcomeSubtitle.value
      alreadyContentGenerated.value = true
      // Optionally keep the raw response for debugging
      console.debug('Generated survey:', response.survey)
    }
  } catch (err) {
    console.error('Error generating content with AI:', err)
  } finally {
    generatingContent.value = false
  }
}

const saveSurvey = async () => {
  savingSurvey.value = true
  try {
    const response = await $fetch(`/api/backend/projects/${projectId}/manage/surveys`, {
      method: 'POST',
      body: {
        surveyTitle: surveyTitle.value,
        surveyAbout: surveyAbout.value,
        surveyType: surveyType,
        surveyPublic: surveyPublic.value,
        surveyVisible: surveyVisible.value,
        allowAnonymousResponses: surveyAllowAnonymousResponses.value,
        surveyWelcomeTitle: surveyWelcomeTitle.value,
        surveyWelcomeSubtitle: surveyWelcomeSubtitle.value,
        surveyClosedAt: new Date(surveyClosedAt.value.toString() + 'T' + surveyClosedAtTime.value.toString()),
        questions: survey.questions,
        surveyJsonSchema: survey.surveyJsonSchema,
        surveyObjective: null,
        surveyTargetAudience: null,
        surveyContext: null,
        surveyQuestionCount: survey.questions.length,
        surveyUserInstructions: null,
        surveyRequiredQuestions: null
      }
    })
    toast.add({
      title: 'Encuesta guardada',
      description: 'La encuesta ha sido guardada exitosamente.',
      color: 'success'
    })
    console.log('Survey saved response:', response)
    // Optionally navigate to the surveys list page
    navigateTo(`/proyectos/panel/${projectId}/encuestas`)
  } catch (err) {
    console.error('Error saving survey:', err)
    toast.add({
      title: 'Error',
      description: 'Hubo un error al guardar la encuesta. Por favor, intente nuevamente.',
      color: 'error'
    })
  } finally {
    savingSurvey.value = false
  }
}

// Functions to manage generated questions
const deleteQuestion = (index) => {
  if (survey.questions) {
    survey.questions.splice(index, 1)
    if (editingQuestionIndex.value === index) {
      editingQuestionIndex.value = null
    }
  }
}

const moveQuestionUp = (index) => {
  if (index > 0 && survey.questions) {
    const questions = survey.questions
    ;[questions[index - 1], questions[index]] = [questions[index], questions[index - 1]]
  }
}

const moveQuestionDown = (index) => {
  if (survey.questions) {
    const questions = survey.questions
    if (index < questions.length - 1) {
      [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]]
    }
  }
}

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

const editQuestion = (index) => {
  editingQuestionIndex.value = index
}

const cancelQuestionEdit = () => {
  editingQuestionIndex.value = null
}

const saveQuestionEdit = (index, payload) => {
  survey.questions[index] = {
    ...survey.questions[index],
    ...payload
  }

  editingQuestionIndex.value = null
}
</script>

<template>
  <NuxtLayout name="panel-proyecto">
    <UPageHeader
      title="Crear encuesta para explorar acuerdos y desacuerdos"
      description="Usá inteligencia artificial para generar en un solo click una encuesta ideal para relevar rápidamente la opinión de la ciudadanía sobre el proyecto de ley."
    />
    <UPageBody>
      <div
        v-if="!alreadyContentGenerated"
        class="space-y-5"
      >
        <p>Las preguntas están pensadas para invitar a la reflexión, abordar los puntos principales del proyecto y ayudar a identificar acuerdos, desacuerdos y tensiones en la opinión pública.</p>
        <p>Las respuestas son simples: <UBadge label="Sí" variant="outline" size="sm" /> <UBadge label="No" variant="outline" size="sm" /> <UBadge label="No sé" variant="outline" size="sm" /> , lo que facilita la participación y permite que más personas puedan expresar su opinión.</p>
        <UPageCard
          variant="outline"
          class="bg-elevated"
        >
          <UButton
            v-if="!alreadyContentGenerated"
            color="primary"
            icon="lucide:sparkles"
            :loading="generatingContent"
            class="w-full justify-center cursor-pointer"
            @click="generateContentWithAI"
          >
            Crear encuesta automágicamente con IA
          </UButton>
          <UProgress
            v-if="generatingContent && !alreadyContentGenerated"
            animation="swing"
          />
          <ThinkingMessages v-if="generatingContent && !alreadyContentGenerated" />
        </UPageCard>
      </div>
      <UPageCard
        v-if="alreadyContentGenerated"
        variant="subtle"
        class=""
        title="1. Datos basicos"
        description="Completá los campos a continuación para definir los datos básicos de la encuesta. El título es importante para identificar la encuesta, pero si lo dejás vacío la IA generará un título por vos."
      >
        <UFormField label="Título de la encuesta">
          <UInput
            v-model="surveyTitle"
            placeholder="Escribe el título de la encuesta aquí"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Descripción de la encuesta">
          <UTextarea
            v-model="surveyAbout"
            placeholder="Escribe una breve descripción de la encuesta aquí"
            class="w-full"
            :disabled="!alreadyContentGenerated"
          />
        </UFormField>
        <USwitch
          v-model="surveyPublic"
          label="Pública"
          description="Si la encuesta es pública, la misma aparecerá en el HUB del proyecto. Si es privada, solo se podrá acceder a través de un enlace directo que se genera al guardar la encuesta."
        />
        <USwitch
          v-model="surveyAllowAnonymousResponses"
          label="Permitir respuestas anónimas"
          description="Si esta opción está activada, los encuestados podrán enviar sus respuestas sin proporcionar información personal. Si está desactivada, se les pedirá que ingresen su nombre o correo electrónico antes de completar la encuesta."
        />
        <USwitch
          v-model="surveyVisible"
          label="Publicar inmediatamente"
          description="Si esta opción está activada, la encuesta se publicará inmediatamente después de guardarla. Si está desactivada, la encuesta se ocultará y puede editarla todo lo que quiera"
        />
        <UFormField label="Fecha de cierre">
          <template #help>
            La fecha de cierre es la fecha límite para que los encuestados completen la encuesta. Después de esta fecha, la encuesta se cerrará automáticamente y ya no se podrán enviar respuestas. Es importante establecer una fecha de cierre para asegurarse de que la encuesta tenga un período de recopilación de datos definido.
          </template>
          <UInputDate
            ref="inputDate"
            v-model="surveyClosedAt"
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
          <UInputTime v-model="surveyClosedAtTime" />
        </UFormField>
      </UPageCard>
      <UPageCard
        v-if="alreadyContentGenerated"
        variant="subtle"
        title="2. Configurar mensaje de bienvenida"
        description="Personalizá el mensaje de bienvenida que verán los encuestados al iniciar la encuesta. Este mensaje es clave para motivar la participación y explicar brevemente el propósito de la encuesta. Si lo dejás vacío, se utilizará un mensaje de bienvenida genérico."
      >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div class="flex flex-col gap-4">
            <UFormField label="Mensaje de bienvenida para los encuestados">
              <UInput
                v-model="surveyWelcomeTitle"
                placeholder="Escribe el mensaje de bienvenida para los encuestados aquí"
                class="w-full"
                :disabled="!alreadyContentGenerated"
              />
            </UFormField>
            <UFormField label="Subtítulo o instrucciones iniciales para los encuestados">
              <UTextarea
                v-model="surveyWelcomeSubtitle"
                placeholder="Escribe el subtítulo o instrucciones iniciales para los encuestados aquí"
                class="w-full"
                :disabled="!alreadyContentGenerated"
              />
            </UFormField>
          </div>
          <UPageCard
            variant="outline"
            class=""
          >
            <div class="flex flex-col items-center justify-center text-center space-y-2 min-h-75">
              <p class="text-4xl">
                👋
              </p>
              <h1 class="font-bold text-2xl">
                {{ surveyWelcomeTitle }}
              </h1>
              <p class="text-md text-muted">
                {{ surveyWelcomeSubtitle }}
              </p>
            </div>
          </UPageCard>
        </div>
      </UPageCard>
      <SurveyQuestionsListCard
        v-if="alreadyContentGenerated"
        title="3. Preguntas generadas"
        description="A continuación se muestran las preguntas generadas por la IA. Puede editarlas, eliminarlas o reordenarlas antes de guardar la encuesta."
        :questions="survey.questions"
        :editing-index="editingQuestionIndex"
        empty-description="No se han generado preguntas aún. Utilice el botón de arriba para generar preguntas automáticamente con IA."
        @add="addQuestion"
        @edit="editQuestion"
        @save="saveQuestionEdit"
        @cancel="cancelQuestionEdit"
        @move-up="moveQuestionUp"
        @move-down="moveQuestionDown"
        @delete="deleteQuestion"
      />
      <!-- <UPageCard variant="outline" class=" sticky bottom-10 mt-5 z-10" v-if="alreadyContentGenerated">
                <UChatPrompt v-model="userPromptForEdits" @submit="regenerateContentWithAI" :loading="generatingContent" placeholder="De instrucciones de edición para la IA..." :disabled="generatingContent || savingProject">
                    <UChatPromptSubmit :loading="generatingContent" icon="lucide:arrow-right"  />
                </UChatPrompt>
                <UProgress animation="swing" v-if="generatingContent" />
                <ThinkingMessages v-if="generatingContent" />
            </UPageCard> -->
      <UButton
        v-if="alreadyContentGenerated"
        color="primary"
        icon="lucide:save"
        :loading="savingSurvey"
        class="w-full justify-center cursor-pointer mt-5"
        @click="saveSurvey"
      >
        Guardar encuesta
      </UButton>
    </UPageBody>
  </NuxtLayout>
</template>

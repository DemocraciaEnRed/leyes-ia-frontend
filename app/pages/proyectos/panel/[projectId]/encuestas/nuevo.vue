<script setup>
import ConfirmActionModal from '~/components/ConfirmActionModal.vue'
import { CalendarDate, Time } from '@internationalized/date'

definePageMeta({
  layout: 'panel-proyecto',
  middleware: 'auth'
})
const toast = useToast()
const route = useRoute()
const projectId = route.params.projectId

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
const surveyType = 'custom'
const surveyVisible = ref(true)
const surveyAllowAnonymousResponses = ref(false)
const surveyObjective = ref('')
const surveyTargetAudience = ref('')
const surveyUserInstructions = ref('')
const surveyContext = ref('')
const surveyRequiredQuestions = ref(['¿Si tuviera que decirle algo a la persona legisladora, qué querría comunicarle?'])
const surveyQuestionCount = ref(8) // Default value
const survey = reactive({
  questions: [],
  surveyJsonSchema: {}
})

// AI Generation states
const generatingContent = ref(false)
const alreadyContentGenerated = ref(false)
const userPromptForEdits = ref('')
const savingSurvey = ref(false)
const editingQuestionIndex = ref(null)

// functions to manage required questions
const addRequiredQuestion = () => {
  surveyRequiredQuestions.value.push('')
}

const removeRequiredQuestion = (index) => {
  surveyRequiredQuestions.value.splice(index, 1)
}

const generateContentWithAI = async () => {
  generatingContent.value = true
  try {
    // Call your AI service here with the provided inputs
    const response = await $fetch(`/api/backend/projects/${projectId}/manage/surveys/generate`, {
      method: 'POST',
      body: {
        projectId: projectId,
        surveyTargetAudience: surveyTargetAudience.value,
        surveyObjective: surveyObjective.value,
        surveyContext: surveyContext.value,
        surveyQuestionCount: surveyQuestionCount.value,
        surveyUserInstructions: surveyUserInstructions.value,
        surveyRequiredQuestions: surveyRequiredQuestions.value
      }
    })

    if (response && response.survey) {
      // This is the survey schema
      // Survey Schema
      // Each question should have:
      // - questionText: string
      // - type: enum (multiple-choice, open-ended, rating)
      // - options: array of strings (only for multiple-choice or single-choice)
      // - required: boolean
      // - helpText: string (optional)
      // - openTextEnabled: boolean
      // - maxLength: number (only for open-ended)
      // - scale: number (only for rating, e.g., 5 for a 1-5 scale)
      // Also the total number of questions should be limited to questionCount (default 12)
      // const surveyStructure = z.object({
      //     questions: z.array(z.object({
      //         questionText: z.string().describe('El texto de la pregunta a incluir en la encuesta. Nota: No siempre debe ser en formato de pregunta, puede ser una instrucción o una solicitud de feedback.'),
      //         type: z.enum(['multiple-choice', 'open-ended', 'rating', 'single-choice']).describe('El tipo de pregunta: opción múltiple, abierta, calificación o opcion simple.'),
      //         options: z.array(z.string()).optional().describe('Las opciones disponibles para preguntas de opción múltiple o simple, si aplica.'),
      //         required: z.boolean().describe('Indica si la pregunta es obligatoria.'),
      //         helpText: z.string().optional().describe('Texto de ayuda adicional para la pregunta. Utilizar para aclarar conceptos o explicar elementos que la pregunta involucra de una forma simple quitando tecnicismos. O utilizarlo asumiendo que el usuario haya leido el proyecto de ley completo. Explayate todo lo que sea necesario. Incluir referencias y explicaciones, no asumas que el usuario conoce términos técnicos o va a ir a buscar de que se trata lo que le estas referenciando, en todo caso debes explicarlo de forma resumida.'),
      //         openTextEnabled: z.boolean().describe('Indica si se permite texto libre adicional después de la respuesta.'),
      //         maxLength: z.number().optional().describe('La longitud máxima permitida para respuestas abiertas, si aplica.'),
      //         scale: z.number().optional().describe('La escala de calificación para preguntas de calificación, si aplica.'),
      //     })).min(5).max(questionCount || 12), // limit to questionCount questions
      //     surveyJsonSchema: z.object().describe('El JSON Schema que define la estructura de la encuesta generada.'),
      //     answerJsonSchema: z.object().describe('El JSON Schema que define la estructura de las respuestas esperadas para la encuesta generada.')
      // });

      // Validate and set the generated content
      survey.questions = response.survey.questions
      survey.surveyJsonSchema = response.survey.surveyJsonSchema
      alreadyContentGenerated.value = true
      // Optionally keep the raw response for debugging
      console.debug('Generated survey:', response.survey)
    }
  } catch (err) {
    console.error('Error generating content with AI:', err)
    toast.add({
      title: 'Error',
      description: 'Hubo un error al generar la encuesta con IA. Por favor, intente nuevamente.',
      color: 'error'
    })
  } finally {
    generatingContent.value = false
  }
}

/**
     * Regenerate the generated content with AI based on user prompt for edits
     */
const regenerateContentWithAI = () => {
  console.log('Generating edits with AI...')
  // Aquí puedes agregar la lógica para generar contenido usando IA
  // /api/backend/projects/:projectId/generate-edits
  generatingContent.value = true
  $fetch(`/api/backend/projects/${projectId}/manage/surveys/regenerate`, {
    method: 'POST',
    body: {
      userPromptForEdits: userPromptForEdits.value,
      originalSurvey: survey.questions,
      surveyTargetAudience: surveyTargetAudience.value,
      surveyObjective: surveyObjective.value,
      surveyContext: surveyContext.value,
      surveyQuestionCount: surveyQuestionCount.value,
      surveyUserInstructions: surveyUserInstructions.value,
      surveyRequiredQuestions: surveyRequiredQuestions.value
    }
  }).then((response) => {
    console.log('AI generated edits:', response)
    // Update the survey with the new generated content
    survey.questions = response.survey.questions
    survey.surveyJsonSchema = response.survey.surveyJsonSchema
    userPromptForEdits.value = ''
    toast.add({
      icon: 'lucide:check-circle',
      color: 'success',
      title: '¡Genial!',
      description: 'Se generaron las ediciones con IA exitosamente.'
    })
  }).catch((error) => {
    console.error('Error generating edits with AI:', error)
    toast.add({
      icon: 'lucide:alert-circle',
      color: 'error',
      title: '¡Uh oh! Algo salió mal',
      description: 'No se pudo generar las ediciones con IA. Por favor, intentá nuevamente más tarde.'
    })
  }).finally(() => {
    generatingContent.value = false
  })
}

const saveSurvey = async () => {
  savingSurvey.value = true
  try {
    const response = await $authFetch(`/api/backend/projects/${projectId}/manage/surveys`, {
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
        surveyObjective: surveyObjective.value,
        surveyTargetAudience: surveyTargetAudience.value,
        surveyContext: surveyContext.value,
        surveyQuestionCount: surveyQuestionCount.value,
        surveyUserInstructions: surveyUserInstructions.value,
        surveyRequiredQuestions: surveyRequiredQuestions.value
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
const deleteQuestion = async (index) => {
  const questionText = survey.questions?.[index]?.questionText || 'esta pregunta'

  const instance = confirmDeleteModal.open({
    question: 'Eliminar pregunta',
    bodyText: `¿Querés eliminar "${questionText}"? Esta acción no se puede deshacer.`,
    acceptLabel: 'Eliminar',
    cancelLabel: 'Cancelar'
  })

  const confirmed = await instance.result

  if (confirmed && survey.questions) {
    survey.questions.splice(index, 1)
    if (editingQuestionIndex.value === index) {
      editingQuestionIndex.value = null
    }
  }
}

const moveQuestionUp = (index) => {
  if (index > 0 && survey.questions) {
    const questions = survey.questions;
    [questions[index - 1], questions[index]] = [questions[index], questions[index - 1]]
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
  alreadyContentGenerated.value = true
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
    <UPageHeader
      title="Nueva encuesta"
      headline="Encuestas"
      description="Completá estos campos para generar una encuesta adaptada a tu objetivo. Podés dejar cualquier campo vacío para que la IA lo complete por vos."
    />
    <UPageBody>
      <UPageCard
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
            autoresize
            placeholder="Escribe una breve descripción de la encuesta aquí"
            class="w-full"
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
              />
            </UFormField>
            <UFormField label="Subtítulo o instrucciones iniciales para los encuestados">
              <UTextarea
                v-model="surveyWelcomeSubtitle"
                autoresize
                placeholder="Escribe el subtítulo o instrucciones iniciales para los encuestados aquí"
                class="w-full"
              />
            </UFormField>
          </div>
          <UPageCard
            variant="outline"
            class=""
          >
            <div class="flex flex-col items-center justify-center text-center space-y-2 min-h-75">
              <span class="text-xs text-muted opacity-50 absolute top-1 right-2">Vista previa</span>
              <p class="text-4xl">
                👋
              </p>
              <h1 class="font-bold text-2xl">
                {{ surveyWelcomeTitle }}
              </h1>
              <p class="text-md text-muted whitespace-break-spaces">
                {{ surveyWelcomeSubtitle }}
              </p>
              <br>
              <UButton
                color="primary"
                variant="solid"
                trailing-icon="lucide:arrow-right"
              >
                Comenzar
              </UButton>
            </div>
          </UPageCard>
        </div>
      </UPageCard>
      <UPageCard
        variant="subtle"
        title="3. Generar preguntas con IA"
        description="Completá los campos para que la IA genere preguntas alineadas a tu objetivo. Luego podés editar las preguntas generadas o agregar nuevas preguntas manualmente."
      >
        <UFormField label="Objetivo de la encuesta">
          <template #description>
            Defina el propósito principal de la encuesta.
          </template>
          <template #help>
            <p>¿Qué querés entender o descubrir con esta encuesta?</p>
            <p>Explicá el objetivo principal o la decisión que necesitás tomar con los resultados.</p>
            <p>Ej: “Medir satisfacción”, “Entender hábitos de transporte”, “Validar una idea de producto”. </p>
          </template>
          <UTextarea
            v-model="surveyObjective"
            autoresize
            class="w-full"
            :disabled="generatingContent || savingSurvey || alreadyContentGenerated"
            placeholder="Describa el objetivo aquí"
          />
        </UFormField>
        <UFormField label="Audiencia objetivo">
          <template #description>
            Describa el perfil de las personas que responderán la encuesta.
          </template>
          <template #help>
            <p>Podés describir edad, rol, nivel de conocimiento, ubicación o cualquier característica relevante.</p>
            <p>Ej: “Estudiantes universitarios de primer año”, “Vecinos de un barrio”, “Usuarios de una app fintech”.</p>
          </template>
          <UTextarea
            v-model="surveyTargetAudience"
            autoresize
            class="w-full"
            :disabled="generatingContent || savingSurvey || alreadyContentGenerated"
            placeholder="Describa la audiencia aquí"
          />
        </UFormField>
        <UFormField label="Contexto adicional">
          <template #description>
            Información de contexto que el generador debería conocer antes de escribir preguntas.
          </template>
          <template #help>
            <p><i>Sin contexto, la encuesta sale genérica o mal alineada. El objetivo solo no alcanza.</i></p>
            <p>Contá brevemente dónde se usará, quién la envía o en qué situación se responde.</p>
            <p>Ej: “Encuesta post-evento”, “Investigación para una ONG”, “Feedback de usuarios de una app”.</p>
          </template>
          <UTextarea
            v-model="surveyContext"
            autoresize
            class="w-full"
            :disabled="generatingContent || savingSurvey || alreadyContentGenerated"
            placeholder="Proporcione contexto adicional aquí"
          />
        </UFormField>
        <UFormField
          label="Cantidad de preguntas"
          help="Elija cuántas preguntas debe tener la encuesta (mínimo 4, máximo 12)"
        >
          <UInputNumber
            v-model="surveyQuestionCount"
            :min="5"
            :max="12"
            :step="1"
            :disabled="generatingContent || savingSurvey || alreadyContentGenerated"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Instrucciones para la IA">
          <template #description>
            Proporcione instrucciones específicas para guiar a la IA en la generación de la encuesta.
          </template>
          <template #help>
            <p>Indicaciones adicionales para generar la encuesta.</p>
            <p>Podés definir tono, duración, tipo de preguntas, idioma o restricciones.</p>
            <p>Ej: “Máximo 10 preguntas”, “Lenguaje simple”, “Incluir opciones múltiples”, “Evitar preguntas sensibles”.</p>
          </template>
          <UTextarea
            v-model="surveyUserInstructions"
            autoresize
            class="w-full"
            :disabled="generatingContent || savingSurvey || alreadyContentGenerated"
            placeholder="Escriba las instrucciones aquí"
          />
        </UFormField>
        <UFormField :ui="{ labelWrapper: 'w-full m-0' }">
          <template #description>
            Añada preguntas que considere imprescindibles incluir en la encuesta.
          </template>
          <template #help>
            <p>¿Hay preguntas que sí o sí tienen que estar?</p>
            <p>Escribilas en texto libre. Pueden ser preguntas exactas o temas obligatorios.</p>
            <p>Ej: “¿Edad?”, “¿Con qué frecuencia usás bicicleta?”, “Pedir email de contacto”.</p>
          </template>
          <template #label>
            <div class="flex items-center justify-between">
              Preguntas requeridas
            </div>
          </template>
          <div class="flex flex-col gap-2">
            <div
              v-for="(q, idx) in surveyRequiredQuestions"
              :key="idx"
              class="flex gap-2"
            >
              <UInput
                v-model="surveyRequiredQuestions[idx]"
                class="flex-1"
                placeholder="Escriba aquí una pregunta requerida"
                :disabled="generatingContent || savingSurvey || alreadyContentGenerated"
              />
              <UButton
                variant="outline"
                color="neutral"
                :disabled="generatingContent || savingSurvey || alreadyContentGenerated"
                icon="lucide:trash-2"
                @click="removeRequiredQuestion(idx)"
              />
            </div>
            <UButton
              color="neutral"
              variant="subtle"
              class="justify-center cursor-pointer"
              :disabled="generatingContent || savingSurvey || alreadyContentGenerated"
              icon="lucide:plus-circle"
              @click="addRequiredQuestion"
            >
              Añadir pregunta
            </UButton>
          </div>
        </UFormField>
        <UButton
          v-if="!alreadyContentGenerated"
          color="primary"
          icon="lucide:sparkles"
          :loading="generatingContent"
          class="w-full justify-center cursor-pointer"
          @click="generateContentWithAI"
        >
          Generar preguntas automágicamente con IA
        </UButton>
        <UProgress
          v-if="generatingContent && !alreadyContentGenerated"
          animation="swing"
        />
        <ThinkingMessages v-if="generatingContent && !alreadyContentGenerated" />
      </UPageCard>
      <SurveyQuestionsListCard
        v-if="survey && survey.questions"
        title="4. Preguntas generadas"
        description="A continuación se muestran las preguntas generadas por la IA. Puede editarlas, eliminarlas o reordenarlas antes de guardar la encuesta."
        :questions="survey.questions"
        :editing-index="editingQuestionIndex"
        :empty-description="'No se han generado preguntas aún. Utilice el botón de arriba para generar preguntas automáticamente con IA.'"
        :action-disabled="generatingContent || savingSurvey"
        @add="addQuestion"
        @edit="editQuestion"
        @save="saveQuestionEdit"
        @cancel="cancelQuestionEdit"
        @move-up="moveQuestionUp"
        @move-down="moveQuestionDown"
        @delete="deleteQuestion"
      >
        <template #footer>
          <UPageCard
            v-if="alreadyContentGenerated"
            variant="outline"
            class=" sticky bottom-10 mt-5 z-10 mx-4"
          >
            <UChatPrompt
              v-model="userPromptForEdits"
              :loading="generatingContent"
              placeholder="De instrucciones de edición para la IA..."
              :disabled="generatingContent || savingSurvey"
              @submit="regenerateContentWithAI"
            >
              <UChatPromptSubmit
                :loading="generatingContent"
                icon="lucide:arrow-right"
              />
            </UChatPrompt>
            <UProgress
              v-if="generatingContent"
              animation="swing"
            />
            <ThinkingMessages v-if="generatingContent" />
          </UPageCard>
        </template>
      </SurveyQuestionsListCard>
      <!-- <DevOnly>
                <UPageCard variant="outline" class="bg-elevated">
                    <h3 class="text-lg font-semibold mb-3">Esquema JSON de la encuesta</h3>
                    <pre class="max-h-96 overflow-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"><code>{{ JSON.stringify(survey.surveyJsonSchema, null, 2) }}</code></pre>
                </UPageCard>
            </DevOnly> -->
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
</template>

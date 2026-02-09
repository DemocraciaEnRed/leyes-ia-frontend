<script setup>
    import { CalendarDate, Time } from '@internationalized/date'
    import { getQuestionTypeLabel } from '~/utils/getQuestionTypeLabel'

    definePageMeta({
        middleware: 'auth'
    })
    
    const toast = useToast()
    const route = useRoute();    
    const projectId = route.params.projectId;

    const runtimeConfig = useRuntimeConfig()

    const { data: dataResponse, pending, error, refresh } = await useFetch(`/api/backend/projects/${projectId}`);

    // State for AI content generation
    const requiredQuestions = ref(["¿Si tuviera que decirle algo a la persona legisladora, qué querría comunicarle?"]);
    const generatingContent = ref(false);
    const savingSurvey = ref(false);
    const alreadyContentGenerated = ref(false);

    const inputDate = useTemplateRef('inputDate')

    const now = new Date();
    // monthLater should be a date from now to 7 days later
    const monthLater = new Date();
    monthLater.setDate(now.getDate() + 7);
    const minDate = shallowRef(new CalendarDate(now.getFullYear(), now.getMonth() + 1 , now.getDate()  +1))

    const surveyClosedAt = shallowRef(new CalendarDate(monthLater.getFullYear(), monthLater.getMonth() + 1, monthLater.getDate()))
    // make it at 20:00
    const surveyClosedAtTime = shallowRef(new Time(20, 0))

    const surveyTitle = ref('');
    const surveyAbout = ref('');
    const surveyWelcomeTitle = ref('¡Hola! Queremos conocer tu opinión sobre este proyecto de ley.');
    const surveyWelcomeSubtitle = ref('Tu participación es muy valiosa para nosotros. La encuesta no te llevará más de 5 minutos y tus respuestas serán anónimas.');
    const surveyPublic = ref(true);
    const surveyType = 'basic';
    const surveyVisible = ref(true);
    const surveyAllowAnonymousResponses = ref(false);
    const survey = reactive({
        questions: [],
        surveyJsonSchema: {},
    });
    const userPromptForEdits = ref('');
    
    // functions to manage required questions
    const addRequiredQuestion = () => {
        requiredQuestions.value.push('');
    }

    const removeRequiredQuestion = (index) => {
        requiredQuestions.value.splice(index, 1);
    }

    const generateContentWithAI = async () => {
        generatingContent.value = true;
        try {
            // Call your AI service here with the provided inputs
            const response = await $fetch(`/api/backend/projects/${projectId}/surveys/generate-base`, {
                method: 'POST',
                body: {
                    projectId: projectId,
                }
            });
            
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
                survey.questions = response.survey.questions || [];
                survey.surveyJsonSchema = response.survey.surveyJsonSchema || {};
                surveyTitle.value = response.survey.title || '';
                surveyAbout.value = response.survey.about || '';
                surveyWelcomeTitle.value = response.survey.welcomeTitle || surveyWelcomeTitle.value;
                surveyWelcomeSubtitle.value = response.survey.welcomeSubtitle || surveyWelcomeSubtitle.value;
                alreadyContentGenerated.value = true;
                // Optionally keep the raw response for debugging
                console.debug('Generated survey:', response.survey);
            }
        } catch (err) {
            console.error('Error generating content with AI:', err);
        } finally {
            generatingContent.value = false;
        }
    }

    const saveSurvey = async () => {
        savingSurvey.value = true;
        try {
            const response = await $fetch(`/api/backend/projects/${projectId}/surveys`, {
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
            });
            toast.add({
                title: 'Encuesta guardada',
                description: 'La encuesta ha sido guardada exitosamente.',
                color: 'success'
            });
            console.log("Survey saved response:", response);
            // Optionally navigate to the surveys list page
            navigateTo(`/legislador/hubs/${projectId}/encuestas`);
        } catch (err) {
            console.error('Error saving survey:', err);
            toast.add({
                title: 'Error',
                description: 'Hubo un error al guardar la encuesta. Por favor, intente nuevamente.',
                color: 'error'
            });
        } finally {
            savingSurvey.value = false;
        }
    }

    // Functions to manage generated questions
    const deleteQuestion = (index) => {
        if (survey.value && survey.value.questions) {
            survey.value.questions.splice(index, 1);
        }
    }

    const moveQuestionUp = (index) => {
        if (index > 0 && survey.value && survey.value.questions) {
            const questions = survey.value.questions;
            [questions[index - 1], questions[index]] = [questions[index], questions[index - 1]];
        }
    }

    const moveQuestionDown = (index) => {
        if (survey.value && survey.value.questions) {
            const questions = survey.value.questions;
            if (index < questions.length - 1) {
                [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
            }
        }
    }

</script>

<template>
    <NuxtLayout name="panel-proyecto">

        <UPageHeader
            title="Crear encuesta base"
            description="Utilizá la inteligencia artificial para generar automáticamente una encuesta básica con preguntas relevantes y bien estructuradas. Esta herramienta es ideal para obtener rápidamente feedback de los ciudadanos sobre el proyecto de ley, sin necesidad de diseñar la encuesta desde cero."
        />
        <UPageBody>
            <div class="space-y-5" v-if="!alreadyContentGenerated">
                <p>Utilizando un prompt testeado, se generará una encuesta básica con preguntas relevantes y bien estructuradas.</p>
                <UPageCard variant="outline" class="bg-elevated">
                    <UButton color="primary" icon="lucide:sparkles" @click="generateContentWithAI" v-if="!alreadyContentGenerated" :loading="generatingContent" class="w-full justify-center cursor-pointer">
                        Crear encuesta automágicamente con IA
                    </UButton>
                    <UProgress animation="swing" v-if="generatingContent && !alreadyContentGenerated" />
                    <ThinkingMessages v-if="generatingContent && !alreadyContentGenerated" />
                </UPageCard>
            </div>
            <UPageCard variant="subtle" class="" title="1. Datos basicos" description="Completá los campos a continuación para definir los datos básicos de la encuesta. El título es importante para identificar la encuesta, pero si lo dejás vacío la IA generará un título por vos." v-if="alreadyContentGenerated">
                <UFormField label="Título de la encuesta">
                    <UInput v-model="surveyTitle" placeholder="Escribe el título de la encuesta aquí" class="w-full" />
                </UFormField>
                <UFormField label="Descripción de la encuesta">
                    <UTextarea v-model="surveyAbout" placeholder="Escribe una breve descripción de la encuesta aquí" class="w-full" :disabled="!alreadyContentGenerated" />
                </UFormField>
                <USwitch v-model="surveyPublic" label="Pública" description="Si la encuesta es pública, la misma aparecerá en el HUB del proyecto. Si es privada, solo se podrá acceder a través de un enlace directo que se genera al guardar la encuesta." />
                <USwitch v-model="surveyAllowAnonymousResponses" label="Permitir respuestas anónimas" description="Si esta opción está activada, los encuestados podrán enviar sus respuestas sin proporcionar información personal. Si está desactivada, se les pedirá que ingresen su nombre o correo electrónico antes de completar la encuesta." />
                <USwitch v-model="surveyVisible" label="Publicar inmediatamente" description="Si esta opción está activada, la encuesta se publicará inmediatamente después de guardarla. Si está desactivada, la encuesta se ocultará y puede editarla todo lo que quiera" />
                <UFormField label="Fecha de cierre">
                    <template #help>
                        La fecha de cierre es la fecha límite para que los encuestados completen la encuesta. Después de esta fecha, la encuesta se cerrará automáticamente y ya no se podrán enviar respuestas. Es importante establecer una fecha de cierre para asegurarse de que la encuesta tenga un período de recopilación de datos definido.
                    </template>
                    <UInputDate ref="inputDate" v-model="surveyClosedAt">
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
                            <UCalendar v-model="surveyClosedAt" class="p-2" :min-value="minDate" />
                            </template>
                        </UPopover>
                        </template>
                    </UInputDate>
                    <UInputTime v-model="surveyClosedAtTime" />
                 </UFormField>
            </UPageCard>
            <UPageCard variant="subtle" title="2. Configurar mensaje de bienvenida" description="Personalizá el mensaje de bienvenida que verán los encuestados al iniciar la encuesta. Este mensaje es clave para motivar la participación y explicar brevemente el propósito de la encuesta. Si lo dejás vacío, se utilizará un mensaje de bienvenida genérico." v-if="alreadyContentGenerated">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div class="flex flex-col gap-4">
                        <UFormField label="Mensaje de bienvenida para los encuestados">
                            <UInput v-model="surveyWelcomeTitle" placeholder="Escribe el mensaje de bienvenida para los encuestados aquí" class="w-full" :disabled="!alreadyContentGenerated" />
                        </UFormField>
                        <UFormField label="Subtítulo o instrucciones iniciales para los encuestados">
                            <UTextarea v-model="surveyWelcomeSubtitle" placeholder="Escribe el subtítulo o instrucciones iniciales para los encuestados aquí" class="w-full" :disabled="!alreadyContentGenerated" />
                        </UFormField>
                    </div>
                    <UPageCard variant="outline" class="">
                        <div class="flex flex-col items-center justify-center text-center space-y-2 min-h-75">
                            <p class="text-4xl">👋</p>
                            <h1 class="font-bold text-2xl">{{ surveyWelcomeTitle }}</h1>
                            <p class="text-md text-muted">{{ surveyWelcomeSubtitle }}</p>
                        </div>
                    </UPageCard>
                </div>
            </UPageCard>
            <UPageCard variant="outline" title="3. Preguntas generadas" description="A continuación se muestran las preguntas generadas por la IA. Puede editarlas, eliminarlas o reordenarlas antes de guardar la encuesta." v-if="alreadyContentGenerated" >
                <UEmpty
                    v-if="!alreadyContentGenerated"
                    variant="naked"
                    icon="lucide:circle-slash"
                    title="No hay preguntas"
                    class="mx-auto"
                    description="No se han generado preguntas aún. Utilice el botón de arriba para generar preguntas automáticamente con IA."
                />
                <UPageCard 
                    v-for="(question, index) in survey.questions" 
                    :key="index"
                    variant="outline"
                    class="bg-elevated"
                >
                    <div class="flex justify-between items-start gap-4">
                        <div class="flex-1 space-y-3">
                            <div class="flex items-start gap-3">
                                <UBadge color="primary" variant="subtle">{{ index + 1 }}</UBadge>
                                <div class="flex-1">
                                    <h3 class="text-lg font-semibold">{{ question.questionText }}</h3>
                                </div>
                            </div>
                            <div v-if="question.helpText" class="text-sm text-gray-600 dark:text-gray-400">
                                <span class="font-medium"></span> {{ question.helpText }}
                            </div>
                            
                            <div class="flex gap-2 flex-wrap">
                                <UBadge color="neutral" variant="subtle">
                                    {{ getQuestionTypeLabel(question.type) }}
                                </UBadge>
                                <UBadge v-if="question.scale" color="neutral" variant="subtle">
                                    Escala: 1-{{ question.scale }}
                                </UBadge>
                                <UBadge v-if="question.maxLength" color="neutral" variant="subtle">
                                    Máx: {{ question.maxLength }} caracteres
                                </UBadge>
                                <UBadge v-if="question.required" color="error" variant="subtle">
                                    Obligatoria
                                </UBadge>
                                <UBadge v-else color="neutral" variant="subtle">
                                    Opcional
                                </UBadge>
                            </div>
                            
                            
                            <div v-if="question.options && question.options.length > 0" class="space-y-1">
                                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Opciones:</p>
                                <ul class="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <li v-for="(option, optIndex) in question.options" :key="optIndex">
                                        {{ option }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="flex flex-col gap-2">
                            <UButton 
                                icon="lucide:arrow-up" 
                                class="cursor-pointer"
                                color="neutral" 
                                variant="outline" 
                                size="sm"
                                :disabled="index === 0"
                                @click="moveQuestionUp(index)"
                            />
                            <UButton 
                                icon="lucide:arrow-down" 
                                class="cursor-pointer"
                                color="neutral" 
                                variant="outline" 
                                size="sm"
                                :disabled="index === survey.questions.length - 1"
                                @click="moveQuestionDown(index)"
                            />
                            <UButton 
                                icon="lucide:trash-2" 
                                class="cursor-pointer"
                                color="warning" 
                                variant="outline" 
                                size="sm"
                                @click="deleteQuestion(index)"
                            />
                        </div>
                    </div>
                </UPageCard>
            </UPageCard>
             <!-- <UPageCard variant="outline" class=" sticky bottom-10 mt-5 z-10" v-if="alreadyContentGenerated">
                <UChatPrompt v-model="userPromptForEdits" @submit="regenerateContentWithAI" :loading="generatingContent" placeholder="De instrucciones de edición para la IA..." :disabled="generatingContent || savingProject">
                    <UChatPromptSubmit :loading="generatingContent" icon="lucide:arrow-right"  />
                </UChatPrompt>
                <UProgress animation="swing" v-if="generatingContent" />
                <ThinkingMessages v-if="generatingContent" />
            </UPageCard> -->
            <UButton color="primary" icon="lucide:save" @click="saveSurvey" v-if="alreadyContentGenerated" :loading="savingSurvey" class="w-full justify-center cursor-pointer mt-5">
                    Guardar encuesta
            </UButton>
        </UPageBody>
  </NuxtLayout> 
</template>
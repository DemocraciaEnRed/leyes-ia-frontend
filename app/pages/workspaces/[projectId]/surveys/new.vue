<script setup>

definePageMeta({
  layout: 'workspace'
})
    const route = useRoute();
    
    const projectId = route.params.projectId;

    const runtimeConfig = useRuntimeConfig()

    const { data: dataResponse, pending, error, refresh } = await useFetch(`${runtimeConfig.public.apiUrl}/projects/${projectId}`);

    // State for AI content generation
    const userInstructions = ref('');
    const surveyObjective = ref('');
    const requiredQuestions = ref(["¿Si tuviera que decirle algo al diputado, que querria comunicarle?"]);
    const generatingContent = ref(false);
    const savingSurvey = ref(false);
    const alreadyContentGenerated = ref(false);
    const surveyGeneratedContent = ref(null);
    
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
            const response = await $fetch(`${runtimeConfig.public.apiUrl}/projects/${projectId}/survey/generate`, {
                method: 'POST',
                body: {
                    projectId: projectId,
                    instructions: userInstructions.value,
                    objective: surveyObjective.value,
                    requiredQuestions: requiredQuestions.value
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
                surveyGeneratedContent.value = response.survey;
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

</script>

<template>
    <NuxtLayout name="workspace">

        <UPageHeader
            title="Nueva encuesta"
            :headline="`${dataResponse?.project.name || 'Cargando...'}`"
        />
        <UPageBody>
            <UPageCard variant="outline" class="bg-elevated">
                <UFormField label="Instrucciones">
                    <template #help>
                        Incluya instrucciones claras para la IA sobre que tipo de preguntas y que especificaciones tiene que tener en cuenta la IA al generar las preguntas en base al proyecto de ley. Por ejemplo, la audiencia objetivo, el tono, si tiene que tener en cuenta aspectos del contexto, etc. Por ejemplo: "Necesito crear un survey que este mas destinada a el sector economico que le pueda afectar este proyecto de ley, por lo que las preguntas deben estar orientadas a medir el impacto economico y no tanto el social."
                    </template>
                    <UTextarea autoresize v-model="userInstructions" class="w-full" :disabled="generatingContent || savingSurvey"
                        placeholder="Escriba aquí" />
                </UFormField>
                <UFormField label="Objetivo de la encuesta">
                    <template #help>
                        Defina el objetivo principal de la encuesta para guiar la generación de preguntas. Como por ejemplo, que desea medir o descubrir. Por ejemplo: "Obtener el interes sobre el proyecto, si las penas les parece correcto, y si esto les beneficia o les complica la actividad econmica, o si creen que van a tener perdidas de clientes, etc."
                    </template>
                    <UTextarea autoresize v-model="surveyObjective" class="w-full" :disabled="generatingContent || savingSurvey"
                        placeholder="Describa el objetivo aquí" />
                </UFormField>
                    
                <UFormField :ui="{labelWrapper: 'w-full m-0'}">
                    <template #label>
                        <div class="flex items-center justify-between">
                            Preguntas propuestas
                        </div>
                    </template>
                    <div class="flex flex-col gap-2">
                        <div v-for="(q, idx) in requiredQuestions" :key="idx" class="flex gap-2">
                            <UInput v-model="requiredQuestions[idx]" class="flex-1"
                            placeholder="Escriba aquí una pregunta requerida" :disabled="generatingContent || savingSurvey" />
                            <UButton variant="outline" color="neutral" @click="removeRequiredQuestion(idx)"
                            :disabled="generatingContent || savingSurvey"  icon="lucide:trash-2"></UButton>
                        </div>
                        <UButton color="neutral" variant="subtle" class="justify-center cursor-pointer"  @click="addRequiredQuestion" icon="lucide:plus-circle"> Añadir pregunta</UButton>
                    </div>
                </UFormField>
                <UButton color="primary" icon="lucide:sparkles" @click="generateContentWithAI" v-if="!alreadyContentGenerated" :loading="generatingContent" class="w-full justify-center cursor-pointer">
                        Completar campos automagicamente con IA
                </UButton>
            </UPageCard>
            
            <div>
                <!-- Display generated survey content here -->
                <pre class="whitespace-pre-wrap"
                 v-if="surveyGeneratedContent">{{ JSON.stringify(surveyGeneratedContent, null, 2) }}</pre>
            </div>
        </UPageBody>
  </NuxtLayout> 
</template>
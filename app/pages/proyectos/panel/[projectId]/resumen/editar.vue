<script setup>
import { reactive, watch, ref, computed } from 'vue'

const runtimeConfig = useRuntimeConfig()

definePageMeta({
  layout: 'panel-proyecto',
  middleware: 'auth'
})

const toast = useToast()
const route = useRoute()

// Get projectId from route params
const projectId = route.params.projectId

const { data: dataResponse, pending, error, refresh } = await useFetch(`/api/backend/projects/${projectId}/manage`)

if (dataResponse.value?.project?.status === 'published') {
  await navigateTo(`/proyectos/panel/${projectId}/resumen`)
}

// State to manage saving process
const savingProject = ref(false)
const generatingContent = ref(false)
const userPrompt = ref('')
const projectData = reactive({
  title: dataResponse.value?.project.title || null,
  description: dataResponse.value?.project.description || null,
  summary: dataResponse.value?.project.summary || null,
  category: dataResponse.value?.project.category || null,
  content: {
    objective: dataResponse.value?.project.content?.objective || null,
    justification: dataResponse.value?.project.content?.justification || null,
    key_changes: dataResponse.value?.project.content?.key_changes || null,
    impact_on_society: dataResponse.value?.project.content?.impact_on_society || null
  },
  proposed_questions: dataResponse.value?.project.proposed_questions || []
})

const auxAlredyInitialized = () => {
  return projectData.title !== null
    && projectData.description !== null
    && projectData.summary !== null
    && projectData.category !== null
    && projectData.content !== null
    && projectData.proposed_questions !== null
}
const alreadyContentGenerated = ref(auxAlredyInitialized())
const randomKey = ref(Math.random().toString(36).substring(2, 15))

/**
 * Generates a new random key for cache busting
 */
const generateRandomKey = () => {
  randomKey.value = Math.random().toString(36).substring(2, 15)
}

/**
 * Adds a new proposed question to the list
 */
const addProposedQuestion = () => {
  projectData.proposed_questions.push('')
}

/**
 * Removes a proposed question at the specified index
 * @param {number} index - The index of the question to remove
 */
const removeProposedQuestion = (index) => {
  projectData.proposed_questions.splice(index, 1)
}

/**
 * Generates content for the project using AI
 */
const generateContentWithAI = () => {
  console.log('Generating content with AI...')
  // Aquí puedes agregar la lógica para generar contenido usando IA
  // /api/backend/projects/:projectId/manage/fields/generate
  generatingContent.value = true
  $fetch(`/api/backend/projects/${projectId}/manage/fields/generate`, {
    method: 'POST'
  }).then((response) => {
    console.log('AI generated content:', response)
    // Update projectData with the generated content
    projectData.title = response.project.title
    projectData.description = response.project.description
    projectData.summary = response.project.summary
    projectData.category = response.project.category
    projectData.content.objective = response.project.content.objective
    projectData.content.justification = response.project.content.justification
    projectData.content.key_changes = response.project.content.key_changes
    projectData.content.impact_on_society = response.project.content.impact_on_society
    projectData.proposed_questions = response.project.proposed_questions
    generatingContent.value = false
    generateRandomKey()
    alreadyContentGenerated.value = true
    toast.add({
      icon: 'lucide:check-circle',
      color: 'success',
      title: '¡Genial!',
      description: 'Se generó el contenido de los campos con IA exitosamente.'
    })
  }).catch((error) => {
    console.error('Error generating content with AI:', error)
    toast.add({
      icon: 'lucide:alert-circle',
      color: 'error',
      title: '¡Uh oh! Algo salió mal',
      description: 'No se pudo generar el contenido con IA. Por favor, intentá nuevamente más tarde.'
    })
    generatingContent.value = false
  })
}

/**
 * Regenerates content for the project using AI based on user request and the previous fields
 */
const regenerateContentWithAI = () => {
  console.log('Generating edits with AI...')
  // Aquí puedes agregar la lógica para generar contenido usando IA
  // /api/backend/projects/:projectId/manage/fields/regenerate
  generatingContent.value = true
  $fetch(`/api/backend/projects/${projectId}/manage/fields/regenerate`, {
    method: 'POST',
    body: {
      userEditRequest: userPrompt.value,
      previousLawProjectFields: {
        title: projectData.title,
        description: projectData.description,
        summary: projectData.summary,
        category: projectData.category,
        content: {
          objective: projectData.content.objective,
          justification: projectData.content.justification,
          key_changes: projectData.content.key_changes,
          impact_on_society: projectData.content.impact_on_society
        },
        proposed_questions: projectData.proposed_questions
      }
    }
  }).then((response) => {
    console.log('AI generated edits:', response)
    // Update projectData with the generated content
    projectData.title = response.project.title
    projectData.description = response.project.description
    projectData.summary = response.project.summary
    projectData.category = response.project.category
    projectData.content.objective = response.project.content.objective
    projectData.content.justification = response.project.content.justification
    projectData.content.key_changes = response.project.content.key_changes
    projectData.content.impact_on_society = response.project.content.impact_on_society
    projectData.proposed_questions = response.project.proposed_questions
    generatingContent.value = false
    generateRandomKey()
    userPrompt.value = ''
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
    generatingContent.value = false
  })
}

/**
 * Saves the current project data to the backend
 */
const saveProject = () => {
  savingProject.value = true
  console.log('Saving project data:', projectData)
  const payload = {
    title: projectData.title,
    description: projectData.description,
    summary: projectData.summary,
    category: projectData.category,
    content: {
      objective: projectData.content.objective,
      justification: projectData.content.justification,
      key_changes: projectData.content.key_changes,
      impact_on_society: projectData.content.impact_on_society
    },
    proposed_questions: projectData.proposed_questions
  }

  $fetch(`/api/backend/projects/${projectId}/manage/fields`, {
    method: 'PUT',
    body: payload
  }).then((response) => {
    console.log('Project saved successfully:', response)
    toast.add({
      icon: 'lucide:check-circle',
      color: 'success',
      title: '¡Proyecto guardado!',
      description: 'Los cambios en el proyecto de ley se han guardado exitosamente.'
    })
    navigateTo(`/proyectos/panel/${projectId}`)
  }).catch((error) => {
    console.error('Error saving project data:', error)
    toast.add({
      icon: 'lucide:alert-circle',
      color: 'error',
      title: '¡Uh oh! Algo salió mal',
      description: 'No se pudo guardar el proyecto. Por favor, intentá nuevamente más tarde.'
    })
  })
}

const categoriasItems = getCategorias()

const toolbarItems = [
  // History controls
  [{
    kind: 'undo',
    icon: 'i-lucide-undo',
    tooltip: { text: 'Undo' }
  }, {
    kind: 'redo',
    icon: 'i-lucide-redo',
    tooltip: { text: 'Redo' }
  }],
  // Block types
  [{
    icon: 'i-lucide-heading',
    tooltip: { text: 'Headings' },
    content: {
      align: 'start'
    },
    items: [{
      kind: 'heading',
      level: 1,
      icon: 'i-lucide-heading-1',
      label: 'Heading 1'
    }, {
      kind: 'heading',
      level: 2,
      icon: 'i-lucide-heading-2',
      label: 'Heading 2'
    }, {
      kind: 'heading',
      level: 3,
      icon: 'i-lucide-heading-3',
      label: 'Heading 3'
    }, {
      kind: 'heading',
      level: 4,
      icon: 'i-lucide-heading-4',
      label: 'Heading 4'
    }]
  }, {
    icon: 'i-lucide-list',
    tooltip: { text: 'Lists' },
    content: {
      align: 'start'
    },
    items: [{
      kind: 'bulletList',
      icon: 'i-lucide-list',
      label: 'Bullet List'
    }, {
      kind: 'orderedList',
      icon: 'i-lucide-list-ordered',
      label: 'Ordered List'
    }]
  }, {
    kind: 'blockquote',
    icon: 'i-lucide-text-quote',
    tooltip: { text: 'Blockquote' }
  }, {
    kind: 'horizontalRule',
    icon: 'i-lucide-separator-horizontal',
    tooltip: { text: 'Horizontal Rule' }
  }],
  // Text formatting
  [{
    kind: 'mark',
    mark: 'bold',
    icon: 'i-lucide-bold',
    tooltip: { text: 'Bold' }
  }, {
    kind: 'mark',
    mark: 'italic',
    icon: 'i-lucide-italic',
    tooltip: { text: 'Italic' }
  }, {
    kind: 'mark',
    mark: 'underline',
    icon: 'i-lucide-underline',
    tooltip: { text: 'Underline' }
  }, {
    kind: 'mark',
    mark: 'strike',
    icon: 'i-lucide-strikethrough',
    tooltip: { text: 'Strikethrough' }
  }, {
    kind: 'mark',
    mark: 'code',
    icon: 'i-lucide-code',
    tooltip: { text: 'Code' }
  }],
  // Link
  [{
    kind: 'link',
    icon: 'i-lucide-link',
    tooltip: { text: 'Link' }
  }]
]
</script>

<template>
    <UPageHeader
      title="Editar resumen"
      class="mb-6"
      description="Modifica el resumen que se mostrará en el Hub del proyecto de ley. Completa los campos manualmente o utiliza la IA para generar el contenido automáticamente."
    />
    <UPageBody>
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
          Completar campos automagicamente con IA
        </UButton>
        <UChatPrompt
          v-if="alreadyContentGenerated"
          v-model="userPrompt"
          :loading="generatingContent"
          placeholder="¿Qué necesita que edite la AI de lo que ya generó?"
          :disabled="generatingContent || savingProject"
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

      <UFormField
        label="Título del proyecto"
        help="Ingrese un titulo. No necesariamente tiene que ser un titulo tecnico, puede ser un titulo llamativo para captar la atencion de los ciudadanos."
      >
        <UInput
          v-model="projectData.title"
          class="w-full"
          :disabled="generatingContent || savingProject"
          placeholder="Escriba aquí"
        />
      </UFormField>
      <UFormField label="Categoría del proyecto">
        <!-- <UInput v-model="projectData.category" class="w-full" :disabled="generatingContent"
                        placeholder="Escriba aquí" /> -->
        <USelect
          v-model="projectData.category"
          :items="categoriasItems"
          class="w-full"
          :disabled="generatingContent || savingProject"
          placeholder="Seleccione una categoría"
        />
      </UFormField>
      <UFormField label="Descripción breve">
        <UTextarea
          v-model="projectData.description"
          class="w-full"
          :disabled="generatingContent || savingProject"
          autoresize
          placeholder="Escriba aquí..."
        />
      </UFormField>

      <UFormField label="Resumen ejecutivo">
        <div class="flex gap-2">
          <UEditor
            v-slot="{ editor }"
            v-model="projectData.summary"
            :editable="!(generatingContent || savingProject)"
            content-type="markdown"
            class="w-full border border-accented rounded pt-1 pb-2"
            placeholder="Escriba aquí..."
          >
            <UEditorToolbar
              :editor="editor"
              :items="toolbarItems"
              class="sm:px-8 overflow-x-auto border-b border-accented pb-1 mb-3"
            />
          </UEditor>
        </div>
      </UFormField>
      <UFormField label="Objetivo">
        <div class="flex gap-2">
          <!-- <UTextarea variant="none" :autoresize="true" v-model="projectData.content.objective" class="w-1/2" :disabled="generatingContent"
                                placeholder="Escriba aquí..." :rows="3" />
                            <MDC class="border border-accented rounded w-1/2 p-2" :value="projectData.content.objective" :cache-key="`objective-${randomKey}`" /> -->
          <UEditor
            v-slot="{ editor }"
            v-model="projectData.content.objective"
            :editable="!(generatingContent || savingProject)"
            content-type="markdown"
            class="w-full border border-accented rounded pt-1 pb-2"
            placeholder="Escriba aquí..."
          >
            <UEditorToolbar
              :editor="editor"
              :items="toolbarItems"
              class="sm:px-8 overflow-x-auto border-b border-accented pb-1 mb-3"
            />
          </UEditor>
        </div>
      </UFormField>
      <UFormField label="Justificación">
        <div class="flex gap-2">
          <!-- <UTextarea :autoresize="true" v-model="projectData.content.justification" class="w-1/2"
                                :disabled="generatingContent" placeholder="Escriba aqui" :rows="3" />
                            <MDC class="border border-accented rounded w-1/2 p-2"
                                :value="projectData.content.justification" /> -->
          <UEditor
            v-slot="{ editor }"
            v-model="projectData.content.justification"
            :editable="!(generatingContent || savingProject)"
            content-type="markdown"
            class="w-full border border-accented rounded pt-1 pb-2"
            placeholder="Escriba aquí..."
          >
            <UEditorToolbar
              :editor="editor"
              :items="toolbarItems"
              class="sm:px-8 overflow-x-auto border-b border-accented pb-1 mb-3"
            />
          </UEditor>
        </div>
      </UFormField>
      <UFormField label="Cambios clave propuestos">
        <div class="flex gap-2">
          <!-- <UTextarea :autoresize="true" v-model="projectData.content.key_changes" class="w-1/2"
                                :disabled="generatingContent" placeholder="Escriba aqui" :rows="3" />
                            <MDC class="border border-accented rounded w-1/2 p-2" :value="projectData.content.key_changes" :cache-key="`key_changes-${randomKey}`" /> -->
          <UEditor
            v-slot="{ editor }"
            v-model="projectData.content.key_changes"
            :editable="!(generatingContent || savingProject)"
            content-type="markdown"
            class="w-full border border-accented rounded pt-1 pb-2"
            placeholder="Escriba aquí..."
          >
            <UEditorToolbar
              :editor="editor"
              :items="toolbarItems"
              class="sm:px-8 overflow-x-auto border-b border-accented pb-1 mb-3"
            />
          </UEditor>
        </div>
      </UFormField>
      <UFormField label="Impacto en la sociedad">
        <div class="flex gap-2">
          <!-- <UTextarea :autoresize="true" v-model="projectData.content.impact_on_society" class="w-1/2"
                                :disabled="generatingContent" placeholder="Escriba aqui" :rows="3" />
                            <MDC class="border border-accented rounded w-1/2 p-2"
                                :value="projectData.content.impact_on_society" :cache-key="`impact_on_society-${randomKey}`" /> -->
          <UEditor
            v-slot="{ editor }"
            v-model="projectData.content.impact_on_society"
            :editable="!(generatingContent || savingProject)"
            content-type="markdown"
            class="w-full border border-accented rounded pt-1 pb-2"
            placeholder="Escriba aquí..."
          >
            <UEditorToolbar
              :editor="editor"
              :items="toolbarItems"
              class="sm:px-8 overflow-x-auto border-b border-accented pb-1 mb-3"
            />
          </UEditor>
        </div>
      </UFormField>
      <UFormField :ui="{ labelWrapper: 'w-full m-0' }">
        <template #label>
          <div class="flex items-center justify-between">
            Preguntas propuestas
          </div>
        </template>
        <div class="flex flex-col gap-2">
          <div
            v-for="(q, idx) in projectData.proposed_questions"
            :key="idx"
            class="flex gap-2"
          >
            <UInput
              v-model="projectData.proposed_questions[idx]"
              class="flex-1"
              placeholder="Escriba una pregunta propuesta"
              :disabled="generatingContent || savingProject"
            />
            <UButton
              variant="outline"
              color="neutral"
              :disabled="generatingContent || savingProject"
              icon="lucide:trash-2"
              @click="removeProposedQuestion(idx)"
            />
          </div>
          <UButton
            color="neutral"
            variant="subtle"
            class="justify-center cursor-pointer"
            icon="lucide:plus-circle"
            @click="addProposedQuestion"
          >
            Añadir pregunta
          </UButton>
        </div>
      </UFormField>
      <USeparator />
      <div class="flex">
        <UButton
          size="xl"
          :loading="savingProject"
          :disabled="generatingContent || savingProject"
          icon="lucide:save"
          class="w-full justify-center cursor-pointer"
          @click="saveProject"
        >
          Guardar campos del proyecto de ley
        </UButton>
      </div>
    </UPageBody>
</template>

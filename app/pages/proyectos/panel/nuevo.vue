<script setup>
import slugify from 'slugify'

definePageMeta({
  layout: 'panel-legislador',
  middleware: 'legislator'
})
const runtimeConfig = useRuntimeConfig()
const toast = useToast()

const isLoading = ref(false)
const stepOneCompleted = ref(false)
const generatingContent = ref(false)

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024

const initProjectData = reactive({
  name: '',
  slug: '',
  authorFullname: '',
  projectPdf: null
})

const creationMode = ref('manual')

const onFileChange = (e) => {
  const file = e.target.files?.[0] ?? null
  if (file && file.size > MAX_PDF_SIZE_BYTES) {
    toast.add({
      title: 'Archivo demasiado grande',
      description: 'El PDF debe pesar menos de 45MB.',
      color: 'error'
    })
    initProjectData.projectPdf = null
    if (e?.target) {
      e.target.value = ''
    }
    return
  }
  initProjectData.projectPdf = file
}

watch(() => initProjectData.name, (newName) => {
  initProjectData.slug = slugify(newName || '', { lower: true, strict: true })
})

const sendStepOne = () => {
  if (initProjectData.projectPdf && initProjectData.projectPdf.size > MAX_PDF_SIZE_BYTES) {
    toast.add({
      title: 'Archivo demasiado grande',
      description: 'El PDF debe pesar menos de 45MB.',
      color: 'error'
    })
    return
  }
  isLoading.value = true
  console.log('Sending Step One Data:', initProjectData)
  // Aquí puedes agregar la lógica para enviar los datos al backend
  // must be a POST and multipart/form-data
  const formData = new FormData()
  formData.append('name', initProjectData.name)
  formData.append('slug', initProjectData.slug)
  formData.append('authorFullname', initProjectData.authorFullname)
  if (initProjectData.projectPdf) {
    formData.append('projectPdf', initProjectData.projectPdf)
  }
  // include initialized project data (optional)
  // formData.append('projectData', JSON.stringify(projectData));
  // Send a POST with $fetch to /api/backend/projects
  $fetch(`/api/backend/projects`, {
    method: 'POST',
    body: formData
  }).then((response) => {
    toast.add({
      title: 'Proyecto creado',
      description: 'El nuevo proyecto de ley ha sido creado exitosamente.',
      color: 'success'
    })
    console.log('Response from backend:', response)
    // ir al panel del proyecto recién creado
    navigateTo(`/proyectos/panel/${response.project.id}?new=true`)
  }).catch((error) => {
    console.error('Error sending data to backend:', error)
    toast.add({
      title: 'Error',
      description: 'Hubo un error al crear el proyecto de ley. Por favor, intente nuevamente.',
      color: 'error'
    })
    isLoading.value = false
  })
}

const isButtonDisabled = computed(() => {
  return !initProjectData.name.trim() || !initProjectData.authorFullname.trim()
})

const frontendUrl = computed(() => {
  return runtimeConfig.public.frontendUrl || ''
})

const creationModes = ref([
  {
    label: 'Manual',
    value: 'manual',
    description: 'Creá tu proyecto desde cero. Podras generar y editar todos los componentes de participación ciudadana a tu tiempo, para luego publicar el proyecto de ley cuando quieras. Recomendado si querés tener control total sobre la información del proyecto y los componentes de participación, y no te molesta dedicarle un poco más de tiempo a la creación del proyecto de ley.'
  },
  {
    label: 'Express',
    value: 'express',
    disabled: true,
    description: 'Subí el PDF del proyecto de ley y generaremos automáticamente un resumen y una encuesta base con inteligencia artificial y prompts testeados. Luego podrás editar toda la información generada automáticamente para corregir o mejorar lo que quieras antes de publicar el proyecto de ley.'
  },
  {
    label: 'Express & Go!',
    value: 'express-go',
    disabled: true,
    description: '¿Con apuro? Subí el PDF y generaremos todo automáticamente y publicaremos el proyecto de ley inmediatamente, sin revisión previa. Recomendado solo si tenés mucha confianza en el resultado de la IA y querés publicar el proyecto lo antes posible.'
  }
])
</script>

<template>
    <UPage>
      <UPageHeader
        title="Nuevo hub de proyecto"
        description="Para comenzar, completá la información básica del proyecto de ley que deseas crear. Esto creará el hub para luego crear componentes de participación ciudadana."
      />
      <UPageBody>
        <UPageCard variant="subtle">
          <UFormField label="Subir PDF del proyecto">
            <template #description>
              Seleccione el archivo PDF con el texto completo del proyecto de ley.
            </template>
            <UInput
              type="file"
              accept=".pdf"
              class="w-full"
              @change="onFileChange"
            />
          </UFormField>
          <UFormField label="Nombre del hub del proyecto">
            <template #description>
              Elije un nombre que identifique claramente el proyecto de ley. Este nombre será utilizado para crear el hub del proyecto, donde podrás gestionar toda la información, documentos y componentes de participación ciudadana
            </template>
            <template #help>
              <i>"Hub del Proyecto: {{ initProjectData.name || '...' }}"</i>
            </template>
            <UInput
              v-model="initProjectData.name"
              class="w-full"
              label="Nombre del proyecto"
              placeholder="Escriba aqui"
            />
          </UFormField>
          <UFormField label="Codigo del proyecto">
            <template #description>
              <b><span class="text-primary">Autogenerado.</span></b> El slug es una versión
              amigable para URL del nombre del proyecto.
            </template>
            <UFieldGroup class="w-full">
              <UBadge
                color="neutral"
                variant="subtle"
                :label="frontendUrl + '/proyectos/'"
              />
              <UInput
                v-model="initProjectData.slug"
                class="w-full"
                placeholder="Escriba aqui"
              />
            </UFieldGroup>
          </UFormField>
          <UFormField label="Nombre completo de quien impulsa el proyecto">
            <template #description>
              Proporcione el nombre completo de quien impulsa el proyecto de ley.
            </template>
            <template #help>
              En el caso que el proyecto tenga múltiples autores, puede ingresar el nombre del autor
              principal o del representante del grupo o del bloque/partido que lo presenta.
            </template>
            <UInput
              v-model="initProjectData.authorFullname"
              class="w-full"
              placeholder="Escriba aqui"
            />
          </UFormField>
          <UFormField label="Modo de creación">
            <template #description>
              Elegí el modo de creación para tu proyecto de ley. El modo Manual te permite completar toda la información paso a paso, mientras que el modo Express genera automáticamente un resumen y una encuesta base a partir del PDF que subas.
            </template>
            <URadioGroup
              v-model="creationMode"
              color="primary"
              variant="table"
              default-value="neutral"
              :items="creationModes"
            />
          </UFormField>
          <UButton
            :loading="isLoading"
            :disabled="isButtonDisabled"
            icon="lucide:sparkle"
            variant="solid"
            class="flex justify-center"
            color="primary"
            @click="sendStepOne"
          >
            Crear Hub del Proyecto
          </UButton>
          <UProgress
            v-if="isLoading"
            animation="swing"
          />
          <ThinkingMessages v-if="isLoading" />
        </UPageCard>
      </UPageBody>
    </UPage>
</template>

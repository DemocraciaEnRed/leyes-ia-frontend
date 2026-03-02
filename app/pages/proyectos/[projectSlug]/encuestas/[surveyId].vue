<script setup lang="ts">
import ConfirmActionModal from '~/components/ConfirmActionModal.vue'

const overlay = useOverlay()
const leaveSurveyModal = overlay.create(ConfirmActionModal)
const route = useRoute()

const projectSlug = computed(() => {
  const slugParam = route.params.projectSlug

  return Array.isArray(slugParam) ? slugParam[0] : slugParam
})

const placeholderQuestions = [
  {
    id: 1,
    questionText: '¿Qué tan clara te resulta la propuesta legislativa?',
    type: 'escala',
    required: true,
    helpText: 'Puedes responder en una escala del 1 al 5, donde 1 es nada clara y 5 es muy clara.'
  },
  {
    id: 2,
    questionText: '¿Cuál crees que sería el principal beneficio de este proyecto?',
    type: 'texto',
    required: false
  },
  {
    id: 3,
    questionText: '¿Apoyarías esta iniciativa en su forma actual?',
    type: 'opción única',
    required: true
  }
]

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
    <SurveyWrapper :questions="placeholderQuestions" />
  </NuxtLayout>
</template>

<script setup>
import { computed } from 'vue'

definePageMeta({
  layout: 'workspace',
  middleware: 'auth'
})
const route = useRoute()
const projectId = route.params.projectId

const { data: dataResponse, status, error, refresh } = await useFetch(`/api/backend/projects/${projectId}/manage`)

const links = computed(() => {
  const baseLinks = [
    {
      label: 'Refrescar',
      icon: 'lucide:refresh-cw',
      onClick: () => refresh()
    }
  ]

  if (dataResponse.value?.project?.status !== 'published') {
    baseLinks.push({
      label: 'Editar',
      icon: 'lucide:edit-3',
      to: `/proyectos/panel/${projectId}/resumen/editar`
    })
  }

  return baseLinks
})
</script>

<template>
  <NuxtLayout name="panel-proyecto">
    <UPageHeader
      title="Resumen del proyecto"
      description="Los siguientes bloques contienen la información principal de tu proyecto de ley. Esta información es la que se mostrará a los usuarios en el sitio web, por lo que es importante que la revises y edites para asegurarte de que esté completa y sea clara para los ciudadanos. Si querés hacer cambios, hacé click en el botón de editar y luego en guardar para actualizar la información del proyecto de ley."
      :links="links"
    />
    <UPageBody v-if="status == 'pending'">
      <UProgress animation="swing" />
    </UPageBody>
    <UPageBody v-if="status == 'success' && dataResponse.project.status == 'created'">
      <UEmpty
        variant="naked"
        icon="lucide:edit"
        title="Creá el resumen del proyecto para continuar"
        class="mx-auto"
        description="El resumen del proyecto de ley es el bloque principal de información del proyecto de ley, y es necesario para publicar el proyecto de ley. Hacé click en el botón de editar para crear el resumen del proyecto de ley y continuar con la creación de tu proyecto."
        :actions="[
          {
            icon: 'lucide:pencil',
            label: 'Generar resumen',
            color: 'neutral',
            variant: 'solid',
            class: 'cursor-pointer',
            to: `/proyectos/panel/${projectId}/resumen/editar`
          }
        ]"
      />
    </UPageBody>

    <UPageBody v-if="status == 'success' && ['ready', 'published'].includes(dataResponse.project.status)">
      <h1 class="text-2xl font-bold mb-4">
        Resumen del Proyecto
      </h1>
      <MDC
        :value="dataResponse?.project.summary"
        class="px-5 py-1 rounded-xl bg-muted/50"
      />
      <h1 class="text-2xl font-bold mb-4">
        Descripción
      </h1>
      <MDC
        :value="dataResponse?.project.description"
        class="px-5 py-1 rounded-xl bg-muted/50"
      />
      <h1 class="text-2xl font-bold mb-4">
        Categoria
      </h1>
      <UBadge
        size="xl"
        variant="subtle"
        color="neutral"
      >
        {{ dataResponse?.project.category }}
      </UBadge>
      <h1 class="text-2xl font-bold mb-4">
        Objetivos del Proyecto
      </h1>
      <MDC
        :value="dataResponse?.project.content.objective"
        class="px-5 py-1 rounded-xl bg-muted/50"
      />
      <h1 class="text-2xl font-bold mb-4">
        Justificacion
      </h1>
      <MDC
        :value="dataResponse?.project.content.justification"
        class="px-5 py-1 rounded-xl bg-muted/50"
      />
      <h1 class="text-2xl font-bold mb-4">
        Cambios principales
      </h1>
      <MDC
        :value="dataResponse?.project.content.key_changes"
        class="px-5 py-1 rounded-xl bg-muted/50"
      />
      <h1 class="text-2xl font-bold mb-4">
        Impacto en la sociedad
      </h1>
      <MDC
        :value="dataResponse?.project.content.impact_on_society"
        class="px-5 py-1 rounded-xl bg-muted/50"
      />
      <h1 class="text-2xl font-bold mb-4">
        Preguntas
      </h1>
      <!-- project.proposed_questions is an array -->
      <div class="flex flex-wrap gap-1">
        <p
          v-for="(question, index) in dataResponse?.project.proposed_questions"
          :key="index"
          class="border border-accented rounded-xl text-sm bg-muted/50 hover:bg-muted/70 py-1 px-2"
        >
          {{ question }}
        </p>
      </div>
    </UPageBody>
  </NuxtLayout>
</template>

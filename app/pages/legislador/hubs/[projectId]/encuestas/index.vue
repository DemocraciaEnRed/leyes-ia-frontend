<script setup>
const runtimeConfig = useRuntimeConfig()

definePageMeta({
  middleware: 'auth'
})
    const route = useRoute();
    const projectId = route.params.projectId;

    const { data: dataResponse, pending, error, refresh } = await useFetch(`/api/backend/projects/${projectId}/surveys`);

    const links = ref([
        {
            label: 'Refrescar',
            icon: 'lucide:refresh-cw',
            onClick: () => refresh()
        },
        {
            label: 'Nueva',
            icon: 'lucide:plus-circle',
            to: `/legislador/hubs/${projectId}/encuestas/nuevo`
        },
        {
            label: 'Crear básica',
            icon: 'lucide:sparkles',
            to: `/legislador/hubs/${projectId}/encuestas/basico`
        }
    ])

</script>

<template>
    <NuxtLayout name="panel-proyecto">

        <UPageHeader
            title="Encuestas"
            headline="Componentes de participación"
            :links="links"
        />
        <UPageBody>
            <UPageCard v-for="survey in dataResponse?.surveys" :key="survey.id" variant="subtle">
                <div class="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div class="mr-3 w-10/12 space-y-2">
                        <h2 class="text-xl font-semibold">{{ survey.title }}</h2>
                        <p class="text-sm text-muted">{{ survey.about }}</p>
                        <p class="text-xs text-muted">Creada el {{ new Date(survey.createdAt).toLocaleDateString() }} a las {{ new Date(survey.createdAt).toLocaleTimeString() }}</p>
                        <USeparator />
                        <div class="flex items-center gap-2">
                            <UFieldGroup>
                                <UBadge color="neutral" variant="outline" class="capitalize">Preguntas</UBadge>
                                <UBadge color="neutral" variant="subtle" class="capitalize">{{ survey.questions.length }}</UBadge>
                            </UFieldGroup>
                            <UFieldGroup>
                                <UBadge color="neutral" variant="outline" class="capitalize">Respuestas</UBadge>
                                <UBadge color="neutral" variant="subtle" class="capitalize">{{ survey.responsesCount }}</UBadge>
                            </UFieldGroup>
                            <UFieldGroup>
                                <UBadge color="neutral" variant="outline" class="capitalize">Tipo</UBadge>
                                <UBadge color="neutral" variant="subtle" class="capitalize">{{ getSurveyType(survey.type) }}</UBadge>
                            </UFieldGroup>
                            <UFieldGroup>
                                <UBadge color="neutral" variant="outline" class="capitalize">Publica</UBadge>
                                <UBadge color="neutral" variant="subtle" class="capitalize">{{ getBooleanTranslation(survey.public) }}</UBadge>
                            </UFieldGroup>
                            <UFieldGroup>
                                <UBadge color="neutral" variant="outline" class="capitalize">Visible</UBadge>
                                <UBadge color="neutral" variant="subtle" class="capitalize">{{ getBooleanTranslation(survey.visible) }}</UBadge>
                            </UFieldGroup>
                        </div>
                    </div>
                    <UButton
                        :to="`/legislador/hubs/${projectId}/encuestas/${survey.id}`"
                        variant="subtle"
                        color="neutral"
                        trailing-icon="lucide:arrow-right"
                    >
                        Ver detalles
                    </UButton>
                </div>
            </UPageCard>
        </UPageBody>
  </NuxtLayout> 
</template>
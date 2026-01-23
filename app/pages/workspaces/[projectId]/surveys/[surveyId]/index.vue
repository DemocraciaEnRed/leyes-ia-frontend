<script setup>
const runtimeConfig = useRuntimeConfig()

definePageMeta({
  layout: 'workspace'
})
    const route = useRoute();
    const projectId = route.params.projectId;
    const surveyId = route.params.surveyId;

    const { data: dataResponse, pending, error, refresh } = await useFetch(`${runtimeConfig.public.apiUrl}/projects/${projectId}`);

</script>

<template>
    <NuxtLayout name="workspace">

        <UPageHeader
            :title="`${dataResponse?.project.name || 'Cargando...'} `"
            headline="Encuesta"
        />
        <UPageBody>
        
            <UPageCard variant="subtle">
                <div class="flex">
                  
                </div>
            </UPageCard>
        </UPageBody>
  </NuxtLayout> 
</template>
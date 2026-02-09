<script setup>
const runtimeConfig = useRuntimeConfig()

definePageMeta({
  layout: 'workspace'
})
    const route = useRoute();
    const projectId = route.params.projectId;
    const surveyId = route.params.surveyId;
    const surveyAnswerId = route.params.surveyAnswerId;

    const { data: dataResponse, pending, error, refresh } = await useFetch(`/api/backend/projects/${projectId}`);

</script>

<template>
    <NuxtLayout name="panel-proyecto">

        <UPageHeader
            :title="`${dataResponse?.project.name || 'Cargando...'} `"
            headline="Respuesta a la encuesta"
        />
        <UPageBody>
        
            <UPageCard variant="subtle">
                <div class="flex">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ducimus, repudiandae obcaecati est similique cum rerum voluptates asperiores placeat totam iste. Molestias ducimus laudantium nostrum sed facere vero repellendus, nulla ipsam?
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ducimus, repudiandae obcaecati est similique cum rerum voluptates asperiores placeat totam iste. Molestias ducimus laudantium nostrum sed facere vero repellendus, nulla ipsam?
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ducimus, repudiandae obcaecati est similique cum rerum voluptates asperiores placeat totam iste. Molestias ducimus laudantium nostrum sed facere vero repellendus, nulla ipsam?
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ducimus, repudiandae obcaecati est similique cum rerum voluptates asperiores placeat totam iste. Molestias ducimus laudantium nostrum sed facere vero repellendus, nulla ipsam?
                </div>
            </UPageCard>
        </UPageBody>
  </NuxtLayout> 
</template>
<script setup>
import { computed } from 'vue';
const runtimeConfig = useRuntimeConfig()

definePageMeta({
    layout: 'workspace'
})
const route = useRoute();
const projectId = route.params.projectId;

const { data: dataResponse, status, error, refresh } = await useFetch(`${runtimeConfig.public.apiUrl}/projects/${projectId}`);

</script>

<template>
    <NuxtLayout name="workspace">

        <UPageHeader :title="`${dataResponse?.project.title || 'Cargando...'} `" :headline="dataResponse?.project.category" :description="dataResponse?.project.description" />
        <UPageBody v-if="status == 'success'" >
                <h1 class="text-2xl font-bold mb-4">Resumen del Proyecto</h1>
                <MDC :value="dataResponse?.project.summary" class="px-5 py-1 rounded-xl bg-muted/50" />
                <h1 class="text-2xl font-bold mb-4">Objetivos del Proyecto</h1>
                <MDC :value="dataResponse?.project.content.objective" class="px-5 py-1 rounded-xl bg-muted/50" />
                <h1 class="text-2xl font-bold mb-4">Justificacion</h1>
                <MDC :value="dataResponse?.project.content.justification" class="px-5 py-1 rounded-xl bg-muted/50" />
                <h1 class="text-2xl font-bold mb-4">Cambios principales</h1>
                <MDC :value="dataResponse?.project.content.key_changes" class="px-5 py-1 rounded-xl bg-muted/50" />
                <h1 class="text-2xl font-bold mb-4">Impacto en la sociedad</h1>
                <MDC :value="dataResponse?.project.content.impact_on_society" class="px-5 py-1 rounded-xl bg-muted/50"/>
                <h1 class="text-2xl font-bold mb-4">Preguntas</h1>
                <!-- project.proposed_questions is an array -->
                 <div class="flex flex-wrap gap-1">
                     <p v-for="(question, index) in dataResponse?.project.proposed_questions" :key="index" class="border border-accented rounded-xl text-sm bg-muted/50 hover:bg-muted/70 py-1 px-2">
                         {{ question }}
                        </p>
                    </div>
        </UPageBody>
    </NuxtLayout>
</template>
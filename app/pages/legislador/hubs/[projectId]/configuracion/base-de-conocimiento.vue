<script setup>
definePageMeta({
    middleware: 'auth'
})
const toast = useToast()
const route = useRoute();
const projectId = route.params.projectId;
const dashboardStatsRef = ref(null)

const searchQuery = ref('');
const numResults = ref(5);
const alpha = ref(0.75);

const searchResults = ref([]);

const actions = ref([
    {
        label: 'Refrescar estado',
        icon: 'lucide:refresh-cw',
        onClick: () => refreshDashboard()
    }
])

const refreshDashboard = async () => {
    await dashboardStatsRef.value?.refresh?.()
}

// State for loading and error handling
const isLoading = ref(false);
const error = ref(null);

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

const searchButtonIsDisabled = computed(() => {
    return !searchQuery.value.trim() || isLoading.value;
});

const searchVectorDatabase = async () => {
    try {
        isLoading.value = true;
        error.value = null;

        $fetch(`/api/backend/projects/${projectId}/knowledge-base/retrieve`, {
            method: 'POST',
            body: {
                query: searchQuery.value,
                num_results: numResults.value,
                alpha: alpha.value
            }
        }).then((response) => {
            searchResults.value = response.results;
            isLoading.value = false;
        }).catch((err) => {
            throw err;
        });
    } catch (error) {
        toast.add({
            title: 'Error al buscar en la base de conocimiento',
            description: 'Ocurrió un error al realizar la búsqueda. Por favor, inténtalo de nuevo.',
            color: 'error'
        });
    } finally {
        isLoading.value = false;
    }
}

</script>

<template>
    <NuxtLayout name="panel-proyecto">

        <UPageHeader title="Base de conocimiento"
            description="Aquí puedes gestionar la base de conocimiento del proyecto de ley, incluyendo documentos, referencias y recursos relacionados. Puede probar buscar en la base de datos vectorial palabras clave, conceptos o temas específicos para encontrar información relevante que pueda ayudar en el desarrollo del proyecto de ley."
            :links="actions" />
        <UPageBody>
            <ProjectKnowledgeBaseDashboardStats ref="dashboardStatsRef" :projectId="projectId" />
            <USeparator />
            <H1 class="font-bold text-2xl">Listado de Documentos</H1>
            <ProjectKnowledgeBaseFilesList :projectId="projectId" ref="fileList" />
            <USeparator />
            <H1 class="font-bold text-2xl">Realizar Busqueda</H1>
            <p>Recupera documentos relevantes de la base de conocimiento mediante búsqueda semántica: busca por
                significado (no solo por palabras exactas) para encontrar información relacionada.</p>

            <UPageCard variant="outline" class="bg-elevated">
                <!-- Query: Preguntas o palabras claves -->
                <UFormField label="Palabras clave para búsqueda en base de conocimiento">
                    <UInput v-model="searchQuery" placeholder="Ejemplo: educación, salud, medio ambiente"
                        class="w-full" />
                </UFormField>
                    <!-- NumResults: Cantidad de resultados -->
                    <UFormField label="Cantidad de resultados a mostrar" class="w-full">
                        <UInputNumber v-model="numResults" :min="1" :max="10" class="w-full" />
                    </UFormField>
                    <!-- Alpha: Peso de la similitud -->

                    <UFormField label="Peso de la similitud (Alpha)" class="w-full mt-4 md:mt-0">
                        <div class="flex gap-4 items-center">
                            <USlider v-model="alpha" :min="0.1" :max="1" step="0.05" class="w-full" />
                            <UBadge variant="outline" color="neutral" size="xl" class="w-20 flex items-center justify-center">
                                {{ alpha.toFixed(2) }}
                            </UBadge>
                        </div>
                        <template #help>
                            <p class="mt-2">Alpha controla cuánto pesa la búsqueda por significado (vectorial) frente a la búsqueda por palabras:</p>
                            <ul class="list-disc list-inside mt-2">
                                <li><strong>0</strong> → sólo búsqueda por palabras (coincidencias textuales).</li>
                                <li><strong>1</strong> → sólo búsqueda vectorial (búsqueda semántica).</li>
                                <li><strong>Entre 0 y 1</strong> → mezcla: cuanto más alto, más importa el significado.</li>
                            </ul>
                            <p class="mt-2"><strong>Ejemplos:</strong> <em>0.25</em> (prioriza palabras), <em>0.5</em> (equilibrado), <em>0.75</em> (prioriza significado).</p>
                            <p class="mt-1 text-sm">Sugerencia: <strong>0.6–0.9</strong> para resultados mása "inteligentes"; <strong>0.2-0.4</strong> si quieres resultados más literales.</p>
                        </template>
                    </UFormField>
                <UButton @click="searchVectorDatabase" :loading="isLoading" :disabled="searchButtonIsDisabled"
                    icon="lucide:search" variant="solid" class="flex justify-center" color="primary">
                    Buscar en Base de Conocimiento
                </UButton>
                <LoadingCard v-if="isLoading" />

            </UPageCard>
            <div class="flex justify-between items-start">
                <H1 class="font-bold text-2xl">Resultados de la búsqueda</H1>
                <UButton variant="outline" color="neutral" class="" @click="searchResults = []" icon="lucide:x-circle">
                    Limpiar
                </UButton>
            </div>
            <div class="space-y-4" v-if="searchResults.length">
                <UPageCard v-for="(item, index) in searchResults"
                    :key="`${item?.metadata?.item_name || 'item'}-${index}`" variant="outline" class="bg-elevated">
                    <div class="space-y-3">
                        <div v-if="item?.text_content"
                            class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {{ item.text_content }}
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <UBadge v-if="item?.metadata?.chunk_category" color="primary" variant="subtle">
                                {{ item.metadata.chunk_category }}
                            </UBadge>
                            <UBadge v-if="item?.metadata?.page_number" color="neutral" variant="subtle">
                                Página {{ item.metadata.page_number }}
                            </UBadge>
                            <UBadge v-if="item?.metadata?.item_name" color="neutral" variant="subtle">
                                {{ item.metadata.item_name }}
                            </UBadge>
                            <UBadge v-if="item?.metadata?.ingested_timestamp" color="neutral" variant="subtle">
                                {{ formatDate(item.metadata.ingested_timestamp) }}
                            </UBadge>
                        </div>

                    </div>
                </UPageCard>
            </div>
        </UPageBody>
    </NuxtLayout>
</template>
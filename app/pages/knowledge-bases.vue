<script setup>
const runtimeConfig = useRuntimeConfig()

definePageMeta({
    layout: 'dashboard'
})

const { data: knowledgeBases } = await useFetch(`/api/backend/knowledge-bases`, {
    method: 'GET'
})
</script>

<template>
    <UDashboardPanel>
        <template #header>
            <UDashboardNavbar title="Bases de conocimiento" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <div>
                
                <h1 class="text-3xl sm:text-4xl text-highlighted font-bold">
                    Bases de conocimientos
                </h1>
                <p class="text-lg text-muted">
                    {{ knowledgeBases.knowledge_bases.length }} bases de conocimiento disponibles.
                </p>
            </div>
            <USeparator icon="i-lucide-book-open" />
            <UCard v-for="kb in knowledgeBases.knowledge_bases" :key="kb.uuid">
                <template #header>
                    <div class="flex ">
                        <div class="flex flex-col">
                            <UCardTitle>{{ kb.name }}</UCardTitle>
                            <UCardSubtitle class="text-sm text-muted">UUID: {{ kb.uuid }}</UCardSubtitle>
                        </div>
                        <div class="flex flex-col text-right ml-auto">
                        <p class="text-sm text-muted">Total tokens used:</p>
                        <p>{{ kb.last_indexing_job.tokens }}</p>
                        </div>
                    </div>
                </template>
            </UCard>
        </template> 
    </UDashboardPanel>
</template>
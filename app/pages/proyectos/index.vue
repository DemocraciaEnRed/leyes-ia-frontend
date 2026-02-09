<script setup>
    // get the category from the query params}
    import { useRoute } from 'vue-router';
    const route = useRoute();
    const runtimeConfig = useRuntimeConfig()
    console.log(typeof route.query.categoria)
    const categoriaSelected = parseInt(route.query.categoria) || undefined;

    const {data: dataResponse, status, refresh, pending } = await useFetch(`/api/backend/projects`, {
        query: {
            categoria: categoriaSelected
        }
    });

    const authors = ref([
    {
        name: 'Guillermo Croppi',
        description: 'Fullstack Developer | AI AntiSlopper',
        avatar: {
        src: 'https://github.com/guillecro.png'
        },
        to: 'https://github.com/guillecro',
        target: '_blank'
    },
    ])

const categorias = [
    "Asuntos Constitucionales",
    "Economía y Hacienda",
    "Educación y Cultura",
    "Salud Pública",
    "Justicia y Derechos Humanos",
    "Seguridad y Defensa",
    "Trabajo y Seguridad Social",
    "Medio Ambiente y Recursos Naturales",
    "Ciencia, Tecnología e Innovación",
    "Relaciones Exteriores",
    "Infraestructura y Transporte",
    "Agricultura, Ganadería y Pesca",
    "Género y Diversidad",
    "Desarrollo Social y Niñez"
]

const getVariant = (isSelected) => {
    // if cetagoriaSelected is defined and equals to index, return 'filled'
    if (categoriaSelected !== undefined && categoriaSelected === isSelected) {
        return 'solid';
    }
    return 'outline';
}



</script>

<template>
    <NuxtLayout name="default">
    <UPageHero
        title="Proyectos"
        description="Estos son algunos de los proyectos que existen sobre esas temáticas"
    >
    <div>
        <p>Seleccione una categoría:</p>
        <UButton v-for ="(categoria, index) in categorias" :key="index" :to="`/proyectos?categoria=${index}`" class="m-1" :variant="getVariant(index)">
            {{ categoria }}
        </UButton>
    </div>
    </UPageHero>
    <USeparator icon="i-lucide-book" class="my-8" />
    
    <UContainer class="">
        <UProgress v-if="pending" indeterminate class="my-4" />
        <div v-if="dataResponse && !pending">
            <UEmpty
            v-if="dataResponse.projects.length === 0"
            variant="naked"
                icon="lucide:inbox"
                title="Sin proyectos"
                class="mx-auto"
                description="No se encontraron proyectos en esta categoría."
                :actions="[
                    {
                    icon: 'lucide:refresh-cw',
                    label: 'Refrescar',
                    color: 'neutral',
                    variant: 'subtle',
                    onClick: () => refresh()
                }
                ]"
            />
            <UPageGrid v-else class="my-8">
                <UBlogPost
                v-for="(project, index) in dataResponse.projects"
                :key="index"
                :title="project.title"
                :description="project.description"
                :date="project.publishedAt"
                :authors="authors"
                />
            </UPageGrid>
        </div>
    </UContainer>
    </NuxtLayout>
</template>
<script setup>
    // get the category from the query params}
    import { useRoute } from 'vue-router';
    const route = useRoute();
    const runtimeConfig = useRuntimeConfig()
    console.log(typeof route.query.categoria)
    const categoriaSelected = parseInt(route.query.categoria) || undefined;

    const {data: dataResponse, status, refresh, pending } = await useFetch(`${runtimeConfig.public.apiUrl}/projects`, {
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
        <UButton v-for ="(categoria, index) in categorias" :key="index" :to="`/projects?categoria=${index}`" class="m-1" :variant="getVariant(index)">
            {{ categoria }}
        </UButton>
    </div>
    </UPageHero>
    <USeparator icon="i-lucide-book" class="my-8" />
    <UContainer class="">
        <div class="text-center text-xl">Estos son algunos de los proyectos que existen sobre esas temáticas <span class="text-primary underline font-light cursor-pointer" @click="refresh">Refrescar</span></div>
        <UProgress v-if="pending" indeterminate class="my-4" />
        <UPageGrid v-if="dataResponse && !pending" class="my-8">
            <div v-if="dataResponse.projects.length === 0" class="text-center text-lg col-span-full">
                No se encontraron proyectos en esta categoría.
            </div>  
            <UBlogPost
                v-for="(project, index) in dataResponse.projects"
                :key="index"
                :title="project.title"
                :description="project.description"
                :date="project.publishedAt"
                :authors="authors"
            />
        </UPageGrid>
    </UContainer>
    </NuxtLayout>
</template>
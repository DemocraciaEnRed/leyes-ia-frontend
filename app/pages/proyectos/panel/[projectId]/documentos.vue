<script setup>
const runtimeConfig = useRuntimeConfig()

definePageMeta({
  layout: 'panel-proyecto',
  middleware: 'auth'
})
const route = useRoute()
const projectId = route.params.projectId

const { data: dataResponse, pending, error, refresh } = await useFetch(`/api/backend/projects/${projectId}/manage`)
</script>

<template>
    <UPageHeader
      :title="`${dataResponse?.project.name || 'Cargando...'} `"
      headline="Documentos"
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
</template>

<script setup>
import slugify from 'slugify';
const { reactive, watch, ref, computed } = await import('vue');
const runtimeConfig = useRuntimeConfig()
const toast = useToast()

const sendingStepOne = ref(false);
const stepOneCompleted = ref(false);
const generatingContent = ref(false);

const initProjectData = reactive({
    name: '',
    slug: '',
    authorFullname: '',
    projectPdf: null
})

const createdProjectData = reactive({
    id: null,
    code: null
});

const projectData = reactive({
    title: '',
    description: '',
    summary: '',
    category: '',
    content: {
        objective: '',
        justification: '',
        key_changes: '',
        impact_on_society: ''
    },
    proposed_questions: []
})

watch(() => initProjectData.name, (newName) => {
    initProjectData.slug = slugify(newName, { lower: true, strict: true });
});

const onFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    initProjectData.projectPdf = file;
};

const addProposedQuestion = () => {
    projectData.proposed_questions.push('');
};

const removeProposedQuestion = (index) => {
    projectData.proposed_questions.splice(index, 1);
};

const sendStepOne = () => {
    sendingStepOne.value = true;
    console.log("Sending Step One Data:", initProjectData);
    // Aquí puedes agregar la lógica para enviar los datos al backend
    // must be a POST and multipart/form-data
    const formData = new FormData();
    formData.append('name', initProjectData.name);
    formData.append('slug', initProjectData.slug);
    formData.append('authorFullname', initProjectData.authorFullname);
    if (initProjectData.projectPdf) {
        formData.append('projectPdf', initProjectData.projectPdf);
    }
    // include initialized project data (optional)
    formData.append('projectData', JSON.stringify(projectData));
    // Send a POST with $fetch to ${runtimeConfig.public.apiUrl}/projects
    $fetch(`${runtimeConfig.public.apiUrl}/projects`, {
        method: 'POST',
        body: formData
    }).then(response => {
        toast.success('Proyecto creado exitosamente');
        console.log("Response from backend:", response);
        // go to /workspaces/projects/:id
        navigateTo(`/workspaces/projects/${response.project.id}/edit`);
    }).catch(error => {
        console.error("Error sending data to backend:", error);
        toast.error('Error al crear el proyecto');
    });
}

</script>

<template>
    <NuxtLayout name="user-settings">
        <UPage>
            <UPageHeader title="Nuevo workspace para proyecto de ley"
                description="Para comenzar, completa la información básica del proyecto de ley que deseas crear. Esto creará el workspace asociado." />
            <div class="flex flex-col gap-5 mt-6">
                <div class="flex flex-col gap-6">
                    <UFormField label="Subir PDF del proyecto">
                        <template #description>
                            Seleccione desde su dispositivo el archivo PDF con el texto completo del proyecto de ley.
                        </template>
                        <UInput type="file" accept=".pdf" class="w-full" @change="onFileChange" size="xl" />
                    </UFormField>
                    <UFormField label="Nombre del workspace">
                        <template #description>
                            Este nombre identifica a tu proyecto y todo el contenido que vayas a crear dentro del mismo.
                        </template>
                        <template #help>
                            Este nombre será solo para uso interno. No necesariamente debe coincidir con el título
                            oficial o con el nombre con el que se lo conoce públicamente.
                        </template>
                        <UInput v-model="initProjectData.name" class="w-full" label="Nombre del proyecto" size="xl"
                            placeholder="Escriba aqui" />
                    </UFormField>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <UFormField label="Codigo del proyecto">
                            <template #description>
                                <b><span class="text-primary">Autogenerado.</span></b> El slug es una versión
                                amigable para URL del nombre del proyecto.
                            </template>
                            <UInput v-model="initProjectData.slug" class="w-full" placeholder="Escriba aqui"
                                size="xl" />
                        </UFormField>
                        <UFormField label="Nombre (completo) de quien impulsa el proyecto">
                            <template #description>
                                Proporcione el nombre completo de quien impulsa el proyecto de ley.
                            </template>
                            <template #help>
                                En el caso que el proyecto tenga múltiples autores, puede ingresar el nombre del autor
                                principal o del representante del grupo o del bloque/partido que lo presenta.
                            </template>
                            <UInput v-model="initProjectData.authorFullname" class="w-full" placeholder="Escriba aqui"
                                size="xl" />
                        </UFormField>
                    </div>
                </div>
                <USeparator />
                    <UButton @click="sendStepOne" :loading="sendingStepOne" icon="lucide:sparkle" variant="solid" class="flex justify-center" color="primary"
                        size="xl">{{
                            sendingStepOne ? 'Guardando...' : 'Crear nuevo workspace' }}</UButton>
                <div class="" v-if="!stepOneCompleted">
                </div>
            </div>
            <UCard class="mt-6" v-if="sendingStepOne">
                <UProgress animation="swing" />
                <ThinkingMessages />
            </UCard>
        </UPage>
    </NuxtLayout>
</template>
<script setup>
const items = ref([
    {     icon: 'i-lucide-circle-help', label: '¿Qué leyes regulan la participación ciudadana en Argentina?', content: 'La participación está respaldada por la Constitución Nacional y por marcos normativos nacionales, provinciales y municipales que regulan consultas, audiencias y acceso a la información.' },
    {     icon: 'i-lucide-circle-help', label: '¿Cómo presento una petición al Estado?', content: 'Se puede presentar por escrito o vía digital ante el organismo correspondiente; muchas jurisdicciones tienen formularios y plazos específicos.' },
    {     icon: 'i-lucide-circle-help', label: '¿Qué es una audiencia pública y cómo participo?', content: 'Es un espacio de consulta abierta sobre políticas o obras públicas; la convocatoria y modalidades se publican en boletines oficiales y webs municipales/provinciales.' },
    {     icon: 'i-lucide-circle-help', label: '¿Cómo funciona la iniciativa popular?', content: 'Permite que ciudadanos promuevan proyectos de norma reuniendo firmas según los requisitos establecidos por la normativa local o provincial.' },
    {     icon: 'i-lucide-circle-help', label: '¿Dónde solicito acceso a información pública?', content: 'Por la Ley de Acceso a la Información Pública y sus equivalentes provinciales; dirigir la solicitud al organismo que custodia la información.' },
    {     icon: 'i-lucide-circle-help', label: '¿Qué es un amparo y cuándo conviene usarlo?', content: 'Recurso judicial urgente para proteger derechos constitucionales frente a actos u omisiones de la autoridad; conviene cuando hay violación inminente de derechos.' },
    {     icon: 'i-lucide-circle-help', label: '¿Cómo funciona el presupuesto participativo?', content: 'Los gobiernos locales abren procesos para que la comunidad proponga y vote proyectos; cada municipio define plazos y criterios de selección.' },
    {     icon: 'i-lucide-circle-help', label: '¿Cuántas firmas hacen falta para una iniciativa ciudadana?', content: 'El quórum varía según jurisdicción; consultar la ordenanza o ley local que regula la iniciativa popular.' },
    {     icon: 'i-lucide-circle-help', label: '¿Cómo denunciar irregularidades en una licitación pública?', content: 'Presentando la denuncia ante el organismo licitante, la oficina de control interno, la fiscalía o la oficina anticorrupción con pruebas documentales.' },
    {     icon: 'i-lucide-circle-help', label: '¿Qué protección tienen los denunciantes?', content: 'Existen normas y políticas de protección para denuncias de buena fe; sus alcances dependen de la jurisdicción y del tipo de denuncia.' },
    {     icon: 'i-lucide-circle-help', label: '¿Puedo impugnar decisiones del concejo deliberante?', content: 'Sí, mediante recursos administrativos o judiciales según lo previsto en la normativa local; conviene asesorarse legalmente.' },
    {     icon: 'i-lucide-circle-help', label: '¿Cómo accedo a asesoramiento legal gratuito?', content: 'A través de defensorías públicas, clínicas jurídicas universitarias y organizaciones sociales que brindan asistencia pro bono.' },
    {     icon: 'i-lucide-circle-help', label: '¿Qué rol tienen las ONG en la participación ciudadana?', content: 'Facilitan información, organizan consultas, acompañan a comunidades y fiscalizan políticas públicas y procesos electorales.' },
    {     icon: 'i-lucide-circle-help', label: '¿Cómo me entero de consultas y audiencias públicas?', content: 'Vigilar boletines oficiales, portales de transparencia, redes municipales/provinciales y plataformas de participación ciudadana.' },
    {     icon: 'i-lucide-circle-help', label: '¿Qué recursos existen para promover cambios legislativos locales?', content: 'Iniciativas ciudadanas, peticiones, participación en comisiones, campañas públicas y diálogo con representantes electos según normativa local.' }
])
</script>

<template>
    <NuxtLayout name="default">
        <UContainer>
            <UPage>
                <UPageHeader title="Acerca de" description="Información sobre la aplicación y su propósito."
                    </UPageHeader>
                    <UPageBody>
                        <UPageCard variant="subtle">
                            <UAccordion  :items="items" :ui="{label: 'font-bold text-lg text-start break-words cursor-pointer', trailingIcon: 'cursor-pointer'}" type="multiple" />
                        </UPageCard>

                    </UPageBody>
            </UPage>
        </UContainer>
    </NuxtLayout>
</template>
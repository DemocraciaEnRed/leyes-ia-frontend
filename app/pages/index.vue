<script setup>
// const links = ref([{
//     label: 'Proyecto: Modernización Laboral 2026',
//     description: 'Proyecto de ley sobre modernización laboral para el año 2026',
//     icon: 'i-lucide-file-text',
//     to: '/chat/11017041c9a0-modernizacion-laboral-2026'
//   }, {
//     label: 'Proyecto: Marco Normativo de Inteligencia Artificial',
//     description: 'Proyecto IA: desarrollo y uso responsable en argentina',
//     icon: 'i-lucide-file-text',
//     to: '/chat/domain-expert-kb04-marco-normaltivo-inteligencia-artificial'
//   }])
const links = ref([
  {
    label: 'Explorá proyectos',
    to: '/proyectos',
    icon: 'lucide:search'
  },
  {
    label: 'Acerca de',
    to: '/acerca-de',
    color: 'neutral',
    variant: 'subtle',
    trailingIcon: 'lucide:arrow-right'
  }
])

const features = ref([
  {
    title: 'Participá de encuestas',
    description: 'Respondé preguntas sobre proyectos de ley, que promueven la reflexión y dejá tu opinión.',
    icon: 'lucide:check-square'
  },
  {
    title: 'Deja comentarios',
    description: 'Tus comentarios lo valen. Contribuí con tus ideas y sugerencias para mejorar los proyectos de ley.',
    icon: 'lucide:message-circle'
  },
  {
    title: 'Hace preguntas',
    description: 'Interactuá con el poder de la IA para obtener respuestas y aclarar tus dudas sobre los proyectos de ley.',
    icon: 'lucide:help-circle'
  }
])

const categorias = getCategorias();

  const actions = ref([{
    label: 'Conocé mas',
    trailingIcon: 'lucide:external-link',
    variant: 'outline',
    href: 'https://blog.democraciaenred.org/democracia-ia-c%C3%B3mo-puede-la-inteligencia-artificial-fortalecer-la-participaci%C3%B3n-ciudadana/',
    target: '_blank'
  }])
</script>

<template>
  <NuxtLayout name="default">
    <UBanner icon="i-lucide-construction" title="Este prototipo esta en desarrollo" :actions="actions" close />
    <UPageHero
    description="La primera plataforma para integrar ciudadanía y legisladores para construir una argentina mejor"
    :links="links"
    orientation="horizontal"
    >
    <template #top>
      <HeroBackground />
    </template>
    <template #title>
      <AppLogo class="h-14 sm:h-16 md:h-20 w-auto mr-auto" />
    </template>
    <div class="relative rounded-xl overflow-hidden mx-auto max-w-4xl w-full">
      <div class="bg-primary/40 dark:bg-primary/80 z-10 top-0 left-0 w-full h-full absolute mix-blend-multiply"></div>
      <video class="rounded-lg" autoplay muted loop playsinline>
        <source src="/congreso.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </UPageHero>
      <USeparator />

      <UContainer class="relative max-w-5/6 mx-auto py-10">
        <h2 class="text-3xl sm:text-5xl font-bold mb-8">
          Explorá las categorias
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-5">
          <UPageCard :spotlight="true" :to="`/proyectos?categoria=${index}`" v-for="(categoria, index) in categorias" :key="`cat-${index}`" class="flex items-center justify-center hover:text-primary">
            <p class="text-lg text-center font-bold">{{ categoria }}</p>
          </UPageCard>
        </div>
        <LazyStarsBackground class="rotate-180" color="white" />
      </UContainer>
      <USeparator class="" />
      <UPageSection
        title="¿Qué podes hacer?"
        description="Particiá en proyectos de ley, interactuá con el poder de la IA, y conocé más sobre las iniciativas legislativas de tu pais"
        :features="features"
        headline="🤔"
        :ui="{
          headline: 'text-5xl'
        }"
      />
      
      <USeparator class="my-8" />
      <UContainer class="text-center">
        <p class="font-semibold">Trabajamos con la tecnología de Google Gemini</p>
        <img src="https://1000logos.net/wp-content/uploads/2024/02/Gemini-Logo.png" alt="Gemini Logo" class="mx-auto mb-6 max-w-50"  />
      </UContainer>
  </NuxtLayout>
</template>

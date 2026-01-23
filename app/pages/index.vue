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
    to: '/projects',
    icon: 'lucide:search'
  },
  {
    label: 'Acerca de',
    to: '/about',
    color: 'neutral',
    variant: 'subtle',
    trailingIcon: 'lucide:arrow-right'
  }
])

const plans = ref([
  {
    title: 'Legislador',
    description: 'Ideal para un legislador.',
    price: '$249',
    features: [
      'Hasta 2 proyectos de ley',
      'Soporte por email'
    ],
    button: {
      label: 'Contactanos',
      variant: 'outline'
    }
  },
  {
    title: 'Equipo Pequeño',
    description: 'Mejor para equipos pequeños.',
    price: '$499',
    scale: true,
    features: [
      'Hasta 3 asesores',
      'Incluye todo las características del plan Legislador',
      'Soporte prioritario por email'
    ],
    button: {
      label: 'Contactanos',
      variant: 'outline'
    }
  },
  {
    title: 'Bloque Parlamentario',
    description: 'Ideal para equipos y organizaciones más grandes.',
    price: '$999',
    features: [
      'Hasta 20 asesores',
      'Incluye todo las características del plan Equipo Pequeño',
      'Soporte por chat en vivo'
    ],
    button: {
      label: 'Contactanos',
      variant: 'outline'
    }
  }
])
const categorias = getCategorias();
</script>

<template>
  <NuxtLayout name="default">
      <UPageHero
      description="La primera plataforma para integrar ciudadanía y legisladores para construir una argentina mejor"
      :links="links"
          orientation="horizontal"

      >
        <template #top>
          <HeroBackground />
        </template>
      <template #title>
        <AppLogo class="h-30 w-auto mr-auto" />
      </template>
      <div class="relative rounded-xl overflow-hidden mx-auto max-w-4xl w-full">
        <div class="bg-primary/40 dark:bg-primary/80 z-10 top-0 left-0 w-full h-full absolute mix-blend-multiply"></div>
        <video class="rounded-lg" autoplay muted loop playsinline>
          <source src="/congreso.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      </UPageHero>
      <USeparator class="" />
      <UContainer class="relative max-w-11/12 mx-auto py-10">
        <h2 class="text-3xl sm:text-5xl font-bold mb-8">
          Explorá las categorias
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-5">
          <UPageCard :spotlight="true" :to="`/projects?categoria=${index}`" v-for="(categoria, index) in categorias" :key="`cat-${index}`" class="flex items-center justify-center hover:text-primary">
            <p class="text-xl font-semibold">{{ categoria }}</p>
          </UPageCard>
        </div>
        <LazyStarsBackground class="rotate-180" color="var(--ui-primary)" />
      </UContainer>
      <USeparator class="" />
      <UContainer>
        <UPricingPlans compact :plans="plans" class="my-25" />
      </UContainer>

      <USeparator class="my-8" />
      <UContainer>

        <UPageLogos
        title="Seguinos en nuestras redes"
        marquee
        :items="[
          'i-simple-icons-github',
          'i-simple-icons-discord',
          'i-simple-icons-x',
          'i-simple-icons-instagram',
          'i-simple-icons-linkedin',
          'i-simple-icons-facebook'
        ]"
    />
  </UContainer>
  </NuxtLayout>
</template>

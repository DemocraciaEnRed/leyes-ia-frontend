<script setup>
definePageMeta({
  layout: 'home'
})

const { loggedIn } = useAuth()
 
const pageHeroLinks = ref([
  {
    label: 'Explorá proyectos',
    to: '/proyectos',
    variant: 'solid',
    size: 'xl',
    color: 'neutral',
    class: 'rounded-full px-6 font-title text-sm md:text-lg font-semibold',
    trailingIcon: 'lucide:arrow-right-circle'
  }
])

// Si no hay un usuario logueado, agregar el boton a pageHeroLinks "Iniciar sesión" que redirija a /login

if (!loggedIn.value) {
  pageHeroLinks.value.push({
    label: 'Iniciar sesión',
    to: '/auth/login',
    variant: 'solid',
    size: 'xl',
    color: 'primary',
    class: 'rounded-full px-6 font-title text-sm md:text-lg font-semibold',
    trailingIcon: 'lucide:log-in'
  })
}

const categorias = getCategorias()


  const bannerActions = ref([{
    label: 'Conocé mas',
    trailingIcon: 'lucide:external-link',
    variant: 'outline',
    href: 'https://blog.democraciaenred.org/democracia-ia-c%C3%B3mo-puede-la-inteligencia-artificial-fortalecer-la-participaci%C3%B3n-ciudadana/',
    target: '_blank'
  }])
</script>

<template>

    <UBanner
      id="home-aviso-prototipo"
      icon="i-lucide-construction"
      title="Este prototipo esta en desarrollo"
      :actions="bannerActions"
      close
      :ui="{
        root: 'z-0'
      }"
    />
    <UPageHero
      :links="pageHeroLinks"
      orientation="vertical"
      class="relative overflow-hidden rounded-b-[3rem] md:rounded-b-[5rem]"
      :ui="{
        title: 'font-title',
        description: 'font-title text-sm md:text-lg text-left', 
        links: 'justify-start',
        wrapper: 'md:mb-15 z-10',
        headline: 'relative',
      }"
    >
      <template #root>
      </template>
      <template #top>
        <div class="absolute w-full max-w-[--ui-container] left-1/2 transform -translate-x-1/2 inset-0 flex items-start justify-end p-6 ">
         <HomeVerticalIconHeader />
       </div>
        <div class="absolute inset-0 -z-10 pointer-events-none">
          <video
            class="h-full w-full object-cover"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            poster="/congreso_first_frame.jpg"
          >
            <source
              src="/congreso.mp4"
              type="video/mp4"
            >
            Your browser does not support the video tag.
          </video>

          <div class="absolute inset-0 bg-linear-to-br from-primary/70 via-black/50 to-cyan-500/45" />
          <div class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />
          <HeroBackground class="opacity-40" />
        </div>
      </template>
      <template #title>
        <AppLogo
          class="h-10 sm:h-13 md:h-18 w-auto mr-auto my-4"
          current-color="#FFFFFF"
        />
      </template>
      <template #description>
        <p class="text-white text-md md:text-3xl font-semibold sm:max-w-1/2">
           La política tiene futuro<br /><b><u>SOLO</u></b> si te involucras
        </p>
      </template>
    </UPageHero>
    <UContainer>
      <div class="bg-accented rounded-3xl p-12 mt-8 md:-mt-16 mb-8 relative z-10">
        <div class="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0">
          <div class="space-y-6 md:space-y-8">
            <h2 class="font-title text-2xl sm:text-4xl font-bold">
              ¿Que podes hacer?
            </h2>
            <p class="mb-0 md:mb-6">Participá en proyectos de ley, interactuá con el poder de la IA y conocé más sobre las iniciativas legislativas de tu país.</p>
            <ULink to="/proyectos" class="hidden md:inline-flex gap-4 w-auto rounded-full bg-white dark:bg-violetita-200 dark:hover:bg-violetita-400 dark:text-inverted dark:hover:text-inverted  hover:bg-primary-300 transition-colors items-center px-6 py-3 font-semibold cursor-pointer">
              <img src="/ideitas.png" class="max-h-[60px] w-auto" />
              <span class="text-xl font-title">Quiero aportar a proyectos</span>
              <Icon name="lucide:arrow-right-circle" size="24" />
            </ULink>
          </div>
          <div class="md:ml-12 md:flex flex-col space-y-6 md:space-y-8">
            <div class="flex gap-8 items-center">
              <img src="/resorte.png" class="max-w-[70px] md:max-w-[90px] w-auto" />
              <p><b>Respondé preguntas</b><br />sobre proyectos de ley, que promueven la reflexión y dejá tu opinión.</p>
            </div>
            <div class="flex gap-8 items-center">
              <img src="/bubble.png" class="max-w-[70px] md:max-w-[90px] w-auto" />
              <p><b>Dejá comentarios</b><br />sobre los proyectos para contribuir al debate.</p>
            </div>
            <div class="flex gap-8 items-center">
              <img src="/papelito.png" class="max-w-[70px] md:max-w-[90px] w-auto" /> 
              <p><b>Hacé preguntas</b><br />sobre los proyectos para entenderlos mejor.</p>
            </div>
          </div>
          <ULink to="/proyectos" class="flex md:hidden w-full justify-center gap-4 rounded-full bg-white hover:bg-verdecito-300 text-black transition-colors items-center px-6 py-3 cursor-pointer">
              <img src="/ideitas.png" class="max-h-[60px] w-auto" />
              <span class="font-semibold md:text-lg font-title" >Quiero aportar a proyectos</span>
              <Icon name="lucide:arrow-right-circle" size="24" />
            </ULink>
          </div>
      </div>
      <div class="bg-azulcito-100 rounded-3xl p-12 my-8 light">
         <UPageCTA
            title="¿Porqué surge demoIA?"
            description="Creada para mejorar la calidad del debate público, visibilizar acuerdos y disensos e incorporar la voz ciudadana en la creación de leyes más representativas."
            orientation="horizontal"
            reverse
            :ui="{
              root: 'bg-transparent ring-0',
              container: 'p-0!',
              title: 'font-title text-3xl sm:text-5xl ',
              description: 'text-lg sm:text-xl'
            }"
            >
             <img
                src="/idontknow.png"
                alt="Illustration"
                class="w-full rounded-lg"
              />
              <template #bottom>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                  <UPageFeature
                    title="Participación con sentido"
                    description="Creemos en una participación que tenga impacto real: los aportes ciudadanos se organizan y transforman en información útil para fortalecer el debate legislativo."
                  />
                  <UPageFeature
                    title="Pluralidad"
                    description="La plataforma busca reflejar la diversidad de voces que existen en torno a un proyecto de ley, sin imponer miradas únicas ni consensos forzados."
                  />
                  <UPageFeature
                    title="Conocimiento abierto"
                    description="Creemos que este proyecto debe aportar al conocimiento colectivo. Por eso, lo que desarrollamos se comparte como código abierto, para que pueda ser reutilizado, auditado y mejorado por otras personas y organizaciones."
                  />
                  <UPageFeature
                    title="Transparencia"
                    description="Buscamos una inteligencia artificial que funcione de forma clara y comprensible, para que cualquiera pueda entender cómo se procesan los aportes y cómo se construyen los resultados."
                  />
                </div>
              </template>
          </UPageCTA>
      </div>
      <div class="bg-accented rounded-3xl p-12">
        <h2 class="font-title text-2xl sm:text-4xl font-bold my-8">
          ¿Tenes preguntas?
        </h2>
        <HomeQuestions />
      </div>
    </UContainer>
    <!-- <USeparator /> -->

    <UContainer class="relative mx-auto py-15">
      <h2 class="text-3xl sm:text-5xl font-bold mb-8 font-title">
        Explorá las categorias
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 mt-5">
        <UPageCard
          v-for="(categoria, index) in categorias"
          :key="`cat-${index}`"
          :spotlight="true"
          :to="`/proyectos?categoria=${index}`"
          class="flex items-center justify-center hover:text-primary"
          :ui="{
            container: 'p-1 sm:p-2'
          }"
        >
          <p class="text-sm text-center font-title font-semibold">
            {{ categoria }}
          </p>
        </UPageCard>
      </div>
      <LazyStarsBackground
        class="rotate-180"
        color="white"
      />
    </UContainer>
    <HomeLatestsPublishedProjects />
    <!-- <USeparator class="" />
    <UPageSection
      title="¿Qué podes hacer?"
      description="Particiá en proyectos de ley, interactuá con el poder de la IA, y conocé más sobre las iniciativas legislativas de tu pais"
      :features="features"
      headline="🤔"
      :ui="{
        headline: 'text-5xl'
      }"
    /> -->
    <UContainer class="text-center">

    </UContainer>
</template>

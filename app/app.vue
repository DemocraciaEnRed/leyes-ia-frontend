<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'es'
  }
})

const title = 'demo+IA'
const description = 'Plataforma para participar colectivamente en proyectos de ley de legisladores argentinos, donde la IA ayuda a la ciudadania a explicar y entender, sin reemplazarla.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp
    :toaster="{ position: 'top-right' }"
    :tooltip="{ delayDuration: 200 }"
  >
    <NuxtLoadingIndicator
      class="z-100"
      color="neutral"
    />
    <NuxtPage />
  </UApp>
</template>

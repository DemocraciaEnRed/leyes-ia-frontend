// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/mdc',
    '@nuxt/icon',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true },
  },
  runtimeConfig: {
    public: {
      backendUrl: process.env.NUXT_BACKEND_URL || 'http://localhost:4000',
      frontendUrl: process.env.NUXT_FRONTEND_URL || 'http://localhost:3000'
    }
  },
  // vite: {
  //   server: {
  //     proxy: {
  //       '/genai': {
  //         target: 'http://localhost:8000',
  //         changeOrigin: true,
  //         rewrite: (path) => path.replace(/^\/genai/, '') 
  //       },
  //       // '/api': {
  //       //   target: 'http://localhost:4000',
  //       //   changeOrigin: true,
  //       //   rewrite: (path) => path.replace(/^\/api/, '') 
  //       // }
  //     }
  //   }
  // },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
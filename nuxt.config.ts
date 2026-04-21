// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/mdc',
    '@nuxt/icon',
    'nuxt-auth-utils',
    'nuxt-charts',
    'nuxt-gtag',
    '@vueuse/nuxt'
  ],

  devtools: {
    enabled: true
  },
  ui: {
    theme: {
      colors: [
        'primary',
        'secondary',
        'info',
        'success',
        'warning',
        'error',
        'azulcito',
        'verdecito',
        'amarillito',
        'violetita',
        'rojito',
        'naranjito',
      ]
    },
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      backendUrl: import.meta.env.NUXT_BACKEND_URL || 'http://localhost:4000',
      frontendUrl: import.meta.env.NUXT_FRONTEND_URL || 'http://localhost:3000'
    }
  },
  // https://nuxt.com/modules/gtag
  // Instead of hard-coding your Google tag ID in your Nuxt configuration,
  // you can set your desired option in your project's .env file,
  // leveraging automatically replaced public runtime config values by
  // matching environment variables at runtime.
  //
  // NUXT_PUBLIC_GTAG_ID=G-XXXXXXXXXX
  gtag: {
    enabled: process.env.NODE_ENV === 'production',
  },
  routeRules: {
    '/': { prerender: true }
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
  hooks: {
    'pages:extend'(pages) {
      const newPrefix = '/mi-cuenta'
      const legacyPrefix = '/user'

      const visit = (items: any[]) => {
        for (const page of items) {
          if (typeof page.path === 'string' && page.path.startsWith(newPrefix)) {
            const suffix = page.path.slice(newPrefix.length)
            const aliases = Array.isArray(page.alias)
              ? page.alias
              : (page.alias ? [page.alias] : [])

            aliases.push(`${legacyPrefix}${suffix}`)
            page.alias = Array.from(new Set(aliases))
          }

          if (Array.isArray(page.children) && page.children.length > 0) {
            visit(page.children)
          }
        }
      }

      visit(pages as any[])
    }
  },
  // hooks: {
  //   'pages:extend'(pages) {
  //     const panelPrefix = '/proyectos/panel'
  //     const legacyPrefix = '/legislador/hubs'
  //     const accountProjectsPath = '/cuenta/proyectos'

  //     const visit = (items: any[]) => {
  //       for (const page of items) {
  //         if (typeof page.path === 'string' && page.path.startsWith(panelPrefix)) {
  //           const suffix = page.path.slice(panelPrefix.length)
  //           const aliases = Array.isArray(page.alias)
  //             ? page.alias
  //             : (page.alias ? [page.alias] : [])

  //           aliases.push(`${legacyPrefix}${suffix}`)

  //           page.alias = Array.from(new Set(aliases))
  //         }

  //         if (page.path === accountProjectsPath) {
  //           const aliases = Array.isArray(page.alias)
  //             ? page.alias
  //             : (page.alias ? [page.alias] : [])

  //           aliases.push(legacyPrefix)
  //           page.alias = Array.from(new Set(aliases))
  //         }

  //         if (Array.isArray(page.children) && page.children.length > 0) {
  //           visit(page.children)
  //         }
  //       }
  //     }

  //     visit(pages as any[])
  //   }
  // },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
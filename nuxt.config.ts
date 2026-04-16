export default defineNuxtConfig({
  devtools: { enabled: true },

  // Auto-import components without subdirectory prefix
  // (components/ui/NavBar.vue → <NavBar>, not <UiNavBar>)
  components: [
    { path: '~/components', pathPrefix: false },
  ],

  modules: [
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxtjs/google-fonts',
    '@vueuse/motion/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  nitro: {
    preset: 'vercel',
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'tr',
    lazy: true,
    // @nuxtjs/i18n v9 resolves langDir relative to the <rootDir>/i18n/ folder
    langDir: 'locales',
    locales: [
      { code: 'tr', name: 'Türkçe', file: 'tr.ts' },
      { code: 'en', name: 'English', file: 'en.ts' },
    ],
    vueI18n: './i18n.config.ts',
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  googleFonts: {
    families: {
      'Space Grotesk': [400, 500, 600, 700],
      Inter: [300, 400, 500, 600],
    },
    display: 'swap',
    preconnect: true,
  },

  runtimeConfig: {
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'tr' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Teknoloji, kültür ve insan ilişkilerinin kesişim noktasında çalışan dijital antropolog ve araştırmacı.',
        },
      ],
    },
  },

  compatibilityDate: '2024-11-01',
})

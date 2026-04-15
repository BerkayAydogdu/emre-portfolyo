import { z } from 'zod'

// ── Locale JSON schema ────────────────────────────────────────────────────────

const localeSchema = z.object({
  nav: z.object({
    about: z.string(),
    projects: z.string(),
    references: z.string(),
    articles: z.string(),
    contact: z.string(),
  }),
  hero: z.object({
    eyebrow: z.string(),
    name: z.string(),
    subtitle: z.string(),
    roles: z.array(z.string()),
    cta: z.string(),
    scroll: z.string(),
  }),
  about: z.object({
    label: z.string(),
    title: z.string(),
    bio1: z.string(),
    bio2: z.string(),
    bio3: z.string(),
    expertiseTitle: z.string(),
    interestsTitle: z.string(),
    expertise: z.object({
      digitalAnthropology: z.string(),
      aiPhilosophy: z.string(),
      culturalAnalysis: z.string(),
      contentCreation: z.string(),
      research: z.string(),
    }),
    interests: z.object({
      ai: z.string(),
      cyberCulture: z.string(),
      philosophy: z.string(),
      sciFi: z.string(),
      mythology: z.string(),
    }),
    stats: z.object({
      years: z.string(),
      articles: z.string(),
      fields: z.string(),
    }),
  }),
  projects: z.object({
    label: z.string(),
    title: z.string(),
    subtitle: z.string(),
    readMore: z.string(),
    medeniyet: z.object({ title: z.string(), description: z.string() }),
    etzHayim: z.object({ title: z.string(), description: z.string() }),
    akis: z.object({ title: z.string(), description: z.string() }),
    veri: z.object({ title: z.string(), description: z.string() }),
  }),
  testimonials: z.object({
    label: z.string(),
    title: z.string(),
    ayse: z.object({ quote: z.string(), title: z.string() }),
    mehmet: z.object({ quote: z.string(), title: z.string() }),
    zeynep: z.object({ quote: z.string(), title: z.string() }),
  }),
  articles: z.object({
    label: z.string(),
    title: z.string(),
    subtitle: z.string(),
    readMore: z.string(),
    readMin: z.string(),
    digitalShadow: z.object({ title: z.string(), excerpt: z.string() }),
    aiCreativity: z.object({ title: z.string(), excerpt: z.string() }),
    metaverse: z.object({ title: z.string(), excerpt: z.string() }),
  }),
  voice: z.object({
    label: z.string(),
    title: z.string(),
    tagline: z.string(),
    subtitle: z.string(),
    orbSubtitle: z.string(),
    speakBtn: z.string(),
    start: z.string(),
    stop: z.string(),
    processing: z.string(),
    listening: z.string(),
    transcriptLabel: z.string(),
    responseLabel: z.string(),
    notSupported: z.string(),
    clickToStart: z.string(),
    errorMic: z.string(),
    errorNoSpeech: z.string(),
    textFallbackLabel: z.string(),
    textPlaceholder: z.string(),
    stopSpeaking: z.string(),
  }),
  chat: z.object({
    title: z.string(),
    online: z.string(),
    welcome: z.string(),
    placeholder: z.string(),
    error: z.string(),
  }),
  contact: z.object({
    label: z.string(),
    title: z.string(),
    subtitle: z.string(),
    location: z.string(),
    social: z.string(),
    copyright: z.string(),
    form: z.object({
      name: z.string(),
      namePlaceholder: z.string(),
      email: z.string(),
      emailPlaceholder: z.string(),
      message: z.string(),
      messagePlaceholder: z.string(),
      submit: z.string(),
      sending: z.string(),
      success: z.string(),
      error: z.string(),
    }),
    info: z.object({
      email: z.string(),
      location: z.string(),
    }),
  }),
})

export { localeSchema }
export type LocaleData = z.infer<typeof localeSchema>

// ── Portfolio data schema ─────────────────────────────────────────────────────

const projectSchema = z.object({
  id: z.string(),
  titleKey: z.string(),
  descriptionKey: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  type: z.enum(['arastirma', 'yazi']).default('arastirma'),
  image: z.string().optional(),
})

const testimonialSchema = z.object({
  id: z.string(),
  quoteKey: z.string(),
  name: z.string(),
  titleKey: z.string(),
  organization: z.string(),
})

const articleSchema = z.object({
  id: z.string(),
  titleKey: z.string(),
  excerptKey: z.string(),
  category: z.string(),
  date: z.string(),
  readMinutes: z.number(),
  slug: z.string(),
})

const expertiseSchema = z.object({
  key: z.string(),
  icon: z.string(),
})

const statSchema = z.object({
  value: z.string(),
  labelKey: z.string(),
})

const portfolioDataSchema = z.object({
  photo: z.string().optional(),
  projects: z.array(projectSchema),
  testimonials: z.array(testimonialSchema),
  articles: z.array(articleSchema),
  expertise: z.array(expertiseSchema),
  interests: z.array(z.string()),
  stats: z.array(statSchema),
})

export { portfolioDataSchema }
export type PortfolioData = z.infer<typeof portfolioDataSchema>

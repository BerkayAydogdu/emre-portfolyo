import type { Project, Testimonial, Article, Expertise, SocialCard, DigitalMindConfig } from './usePortfolioData'

function mergeArticleBodies(fromApi: Article[], staticArticles: Article[]): Article[] {
  return fromApi.map((a) => {
    if (a.body && String(a.body).replace(/\s/g, '').length > 40) return a
    const fb = staticArticles.find((s) => s.slug === a.slug || s.id === a.id)
    if (fb?.body) return { ...a, body: fb.body }
    return a
  })
}

function mergeProjectBodies(fromApi: Project[], staticProjects: Project[]): Project[] {
  return fromApi.map((p) => {
    if (p.body && String(p.body).replace(/\s/g, '').length > 40) return p
    const fb = staticProjects.find((s) => s.id === p.id)
    if (fb?.body) return { ...p, body: fb.body }
    return p
  })
}

interface PortfolioDataRaw {
  photo?: string
  projects: Project[]
  testimonials: Testimonial[]
  articles: Article[]
  expertise: Expertise[]
  interests: string[]
  stats: Array<{ value: string; labelKey: string }>
  socials: SocialCard[]
  digitalMind?: DigitalMindConfig
}

/**
 * Fetches portfolio data from the KV-backed API at runtime.
 * Falls back to static data during SSR or if the request fails.
 */
export function usePortfolioDataRuntime() {
  const { data, status } = useFetch<PortfolioDataRaw>('/api/portfolio-data', {
    key: 'portfolio-data-runtime',
    // SSR-safe: use static data on the server, merge KV data on the client
    lazy: true,
  })

  const static_ = usePortfolioData()

  const photo = computed(() => data.value?.photo ?? null)
  const projects = computed(() =>
    mergeProjectBodies(data.value?.projects ?? static_.projects, static_.projects),
  )
  const testimonials = computed(() => data.value?.testimonials ?? static_.testimonials)
  const articles = computed(() =>
    mergeArticleBodies(data.value?.articles ?? static_.articles, static_.articles),
  )
  const expertise = computed(() => data.value?.expertise ?? static_.expertise)
  const interests = computed(() => data.value?.interests ?? static_.interests)
  const stats = computed(() => data.value?.stats ?? static_.stats)
  const socials = computed(() => data.value?.socials ?? static_.socials)
  const digitalMind = computed(() => data.value?.digitalMind ?? static_.digitalMind)

  return { photo, projects, testimonials, articles, expertise, interests, stats, socials, digitalMind, status }
}

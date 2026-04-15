import type { Project, Testimonial, Article, Expertise } from './usePortfolioData'

interface PortfolioDataRaw {
  photo?: string
  projects: Project[]
  testimonials: Testimonial[]
  articles: Article[]
  expertise: Expertise[]
  interests: string[]
  stats: Array<{ value: string; labelKey: string }>
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
  const projects = computed(() => data.value?.projects ?? static_.projects)
  const testimonials = computed(() => data.value?.testimonials ?? static_.testimonials)
  const articles = computed(() => data.value?.articles ?? static_.articles)
  const expertise = computed(() => data.value?.expertise ?? static_.expertise)
  const interests = computed(() => data.value?.interests ?? static_.interests)
  const stats = computed(() => data.value?.stats ?? static_.stats)

  return { photo, projects, testimonials, articles, expertise, interests, stats, status }
}

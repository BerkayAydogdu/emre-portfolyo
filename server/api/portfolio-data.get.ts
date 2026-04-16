import { getPortfolioDataFromKV } from '~/server/utils/kv'
import { usePortfolioData } from '~/composables/usePortfolioData'

export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production') {
    setResponseHeaders(event, {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    })
  } else {
    setResponseHeaders(event, {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    })
  }

  const kvData = await getPortfolioDataFromKV()
  if (kvData) return kvData

  const { projects, testimonials, articles, expertise, interests, stats } = usePortfolioData()
  return { projects, testimonials, articles, expertise, interests, stats }
})

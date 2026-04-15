import { getPortfolioDataFromKV } from '~/server/utils/kv'
import { usePortfolioData } from '~/composables/usePortfolioData'

export default defineEventHandler(async () => {
  const kvData = await getPortfolioDataFromKV()
  if (kvData) return kvData

  // Fallback: return static data
  const { projects, testimonials, articles, expertise, interests, stats } = usePortfolioData()
  return { projects, testimonials, articles, expertise, interests, stats }
})

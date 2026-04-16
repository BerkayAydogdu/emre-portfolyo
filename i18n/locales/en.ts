import enFallback from './en.json'

export default defineI18nLocale(async () => {
  if (typeof window === 'undefined') return enFallback
  try {
    const data = await $fetch<Record<string, unknown>>('/api/_content/en')
    if (data && typeof data === 'object' && Object.keys(data).length > 0) return data
  }
  catch {}
  return enFallback
})

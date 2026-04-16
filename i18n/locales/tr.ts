import trFallback from './tr.json'

export default defineI18nLocale(async () => {
  if (typeof window === 'undefined') return trFallback
  try {
    const data = await $fetch<Record<string, unknown>>('/api/_content/tr')
    if (data && typeof data === 'object' && Object.keys(data).length > 0) return data
  }
  catch {}
  return trFallback
})

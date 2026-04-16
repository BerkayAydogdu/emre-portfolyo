import enFallback from './en.json'

export default defineI18nLocale(async () => {
  if (typeof window === 'undefined') return enFallback
  try {
    const res = await fetch('/api/_content/en')
    if (!res.ok) return enFallback
    const data = await res.json()
    if (data && typeof data === 'object' && Object.keys(data).length > 0) return data
  }
  catch {}
  return enFallback
})

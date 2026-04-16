import trFallback from './tr.json'

export default defineI18nLocale(async () => {
  if (typeof window === 'undefined') return trFallback
  try {
    const res = await fetch('/api/_content/tr')
    if (!res.ok) return trFallback
    const data = await res.json()
    if (data && typeof data === 'object' && Object.keys(data).length > 0) return data
  }
  catch {}
  return trFallback
})

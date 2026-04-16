function getNestedValue(obj: Record<string, any> | null | undefined, key: string): any {
  if (!obj) return undefined
  const parts = key.split('.')
  let val: any = obj
  for (const part of parts) {
    if (val == null || typeof val !== 'object') return undefined
    val = val[part]
  }
  return val
}

/**
 * Reactive i18n helper that prefers KV-stored locale content over static JSON.
 * Uses the same useFetch-based reactive pattern as Digital Mind.
 */
export function useRuntimeT() {
  const { locales } = usePortfolioDataRuntime()
  const { locale, t, tm } = useI18n()

  function rt(key: string, fallback?: string): string {
    const kvVal = getNestedValue(locales.value?.[locale.value as 'tr' | 'en'], key)
    if (kvVal && typeof kvVal === 'string') return kvVal
    return fallback ?? t(key)
  }

  function rtm(key: string): any[] {
    const kvVal = getNestedValue(locales.value?.[locale.value as 'tr' | 'en'], key)
    if (Array.isArray(kvVal)) return kvVal
    return tm(key) as any[]
  }

  return { rt, rtm }
}

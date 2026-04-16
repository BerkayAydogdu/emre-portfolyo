// Locale content is now served via useRuntimeT() composable which reads
// from usePortfolioDataRuntime() → /api/portfolio-data → KV (_locales key).
// This plugin is kept as a lightweight backup via setLocaleMessage.
export default defineNuxtPlugin(async (nuxtApp) => {
  const i18n = nuxtApp.$i18n as any
  if (!i18n?.setLocaleMessage) return
  try {
    const res = await fetch(`/api/portfolio-data?_=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    const locales = data?._locales
    if (!locales) return
    if (locales.tr && Object.keys(locales.tr).length > 0) i18n.setLocaleMessage('tr', locales.tr)
    if (locales.en && Object.keys(locales.en).length > 0) i18n.setLocaleMessage('en', locales.en)
  }
  catch {}
})

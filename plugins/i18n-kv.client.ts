export default defineNuxtPlugin(async (nuxtApp) => {
  const i18n = nuxtApp.$i18n as any
  if (!i18n?.setLocaleMessage) return

  async function loadLocale(locale: 'tr' | 'en') {
    try {
      const res = await fetch(`/api/_content/${locale}`)
      if (!res.ok) return
      const messages = await res.json()
      if (messages && typeof messages === 'object' && Object.keys(messages).length > 0) {
        i18n.setLocaleMessage(locale, messages)
      }
    }
    catch {}
  }

  const current = (i18n.locale?.value ?? 'tr') as 'tr' | 'en'
  const other = current === 'tr' ? 'en' : 'tr'

  await loadLocale(current)
  loadLocale(other)
})

/**
 * After hydration, fetch locale messages from the KV-backed API and
 * replace the static build-time messages so any admin edits appear
 * without requiring a redeploy.
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const { $i18n } = nuxtApp as unknown as { $i18n: { locale: { value: string }, setLocaleMessage: (locale: string, messages: Record<string, unknown>) => void } }
  if (!$i18n) return

  async function loadLocale(locale: 'tr' | 'en') {
    try {
      const messages = await $fetch<Record<string, unknown>>(`/api/_content/${locale}`)
      $i18n.setLocaleMessage(locale, messages)
    }
    catch {
      // Silently fail — static messages remain in place
    }
  }

  // Load current locale immediately, load the other lazily
  const current = $i18n.locale.value as 'tr' | 'en'
  const other = current === 'tr' ? 'en' : 'tr'

  await loadLocale(current)
  loadLocale(other) // no await — background prefetch
})

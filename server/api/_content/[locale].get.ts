import { getLocaleFromKV } from '~/server/utils/kv'
import trJson from '~/i18n/locales/tr.json'
import enJson from '~/i18n/locales/en.json'

const fallbacks: Record<string, unknown> = {
  tr: trJson,
  en: enJson,
}

export default defineEventHandler(async (event) => {
  const locale = getRouterParam(event, 'locale')
  if (locale !== 'tr' && locale !== 'en') {
    throw createError({ statusCode: 400, message: 'Invalid locale.' })
  }

  // Short-lived cache so CDN/SSR doesn't hammer KV on every request
  // Disabled locally to ensure instant updates in dev
  if (process.env.NODE_ENV === 'production') {
    setResponseHeaders(event, {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    })
  } else {
    setResponseHeaders(event, {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    })
  }

  const kvData = await getLocaleFromKV(locale)
  return kvData ?? fallbacks[locale]
})

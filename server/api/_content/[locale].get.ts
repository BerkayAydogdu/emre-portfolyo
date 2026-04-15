import { getLocaleFromKV } from '~/server/utils/kv'
import trJson from '~/locales/tr.json'
import enJson from '~/locales/en.json'

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
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
  })

  const kvData = await getLocaleFromKV(locale)
  return kvData ?? fallbacks[locale]
})

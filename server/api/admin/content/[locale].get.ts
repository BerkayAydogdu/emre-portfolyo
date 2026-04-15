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
    throw createError({ statusCode: 400, message: 'Invalid locale. Must be "tr" or "en".' })
  }

  const kvData = await getLocaleFromKV(locale)
  return kvData ?? fallbacks[locale]
})

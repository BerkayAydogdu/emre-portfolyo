import { deleteLocaleFromKV } from '~/server/utils/kv'

export default defineEventHandler(async (event) => {
  const locale = getRouterParam(event, 'locale')
  if (locale !== 'tr' && locale !== 'en') {
    throw createError({ statusCode: 400, message: 'Invalid locale. Must be "tr" or "en".' })
  }

  await deleteLocaleFromKV(locale)
  return { ok: true }
})

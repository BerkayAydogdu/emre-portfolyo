import { setLocaleInKV } from '~/server/utils/kv'

export default defineEventHandler(async (event) => {
  const locale = getRouterParam(event, 'locale')
  if (locale !== 'tr' && locale !== 'en') {
    throw createError({ statusCode: 400, message: 'Invalid locale.' })
  }
  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, message: 'Invalid body.' })
  }
  await setLocaleInKV(locale, body)
  return { ok: true }
})

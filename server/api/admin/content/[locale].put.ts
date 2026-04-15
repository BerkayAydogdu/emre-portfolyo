import { localeSchema } from '~/server/schemas/contentSchema'
import { setLocaleInKV } from '~/server/utils/kv'

export default defineEventHandler(async (event) => {
  const locale = getRouterParam(event, 'locale')
  if (locale !== 'tr' && locale !== 'en') {
    throw createError({ statusCode: 400, message: 'Invalid locale. Must be "tr" or "en".' })
  }

  const body = await readBody(event)
  const parsed = localeSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: `Validation error: ${parsed.error.errors[0]?.message ?? 'Invalid data'}`,
    })
  }

  await setLocaleInKV(locale, parsed.data as unknown as Record<string, unknown>)
  return { ok: true }
})

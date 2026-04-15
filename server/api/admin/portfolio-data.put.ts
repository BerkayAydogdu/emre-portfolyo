import { portfolioDataSchema } from '~/server/schemas/contentSchema'
import { setPortfolioDataInKV } from '~/server/utils/kv'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = portfolioDataSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: `Validation error: ${parsed.error.errors[0]?.message ?? 'Invalid data'}`,
    })
  }

  await setPortfolioDataInKV(parsed.data as unknown as Record<string, unknown>)
  return { ok: true }
})

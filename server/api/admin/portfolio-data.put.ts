import { setPortfolioDataInKV } from '~/server/utils/kv'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, message: 'Invalid body.' })
  }
  await setPortfolioDataInKV(body)
  return { ok: true }
})

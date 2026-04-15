import { verifyAdminJwt } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'admin_token')
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized.' })

  try {
    const payload = await verifyAdminJwt(token)
    return { ok: true, exp: payload.exp }
  }
  catch {
    throw createError({ statusCode: 401, message: 'Unauthorized.' })
  }
})

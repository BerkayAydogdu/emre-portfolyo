import { verifyAdminJwt } from '~/server/utils/jwt'

// Protect all /api/admin/* routes except auth/verify and auth/logout
const UNPROTECTED = [
  '/api/admin/auth/verify',
  '/api/admin/auth/logout',
]

export default defineEventHandler(async (event) => {
  const path = event.path ?? getRequestURL(event).pathname

  if (!path.startsWith('/api/admin/')) return
  if (UNPROTECTED.some(u => path.startsWith(u))) return

  const token = getCookie(event, 'admin_token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized.' })
  }

  try {
    await verifyAdminJwt(token)
  }
  catch {
    throw createError({ statusCode: 401, message: 'Unauthorized.' })
  }
})

import { z } from 'zod'
import { signAdminJwt } from '~/server/utils/jwt'
import { verifyTotpCode } from '~/server/utils/totp'
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  isTotpCodeUsed,
  markTotpCodeUsed,
} from '~/server/utils/kv'

const bodySchema = z.object({
  pin: z.string().min(1),
  code: z.string().length(6).regex(/^\d{6}$/),
})

export default defineEventHandler(async (event) => {
  // Rate limit check
  const { allowed } = await checkRateLimit()
  if (!allowed) {
    throw createError({
      statusCode: 429,
      message: 'Too many failed attempts. Try again in 10 minutes.',
    })
  }

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid request body.' })
  }

  const { pin, code } = parsed.data
  const config = useRuntimeConfig()

  // Validate PIN
  if (pin !== config.adminPin) {
    await recordFailedAttempt()
    throw createError({ statusCode: 401, message: 'Invalid credentials.' })
  }

  // Check TOTP replay
  const alreadyUsed = await isTotpCodeUsed(code)
  if (alreadyUsed) {
    await recordFailedAttempt()
    throw createError({ statusCode: 401, message: 'Code already used. Wait for next code.' })
  }

  // Validate TOTP
  const valid = verifyTotpCode(code)
  if (!valid) {
    await recordFailedAttempt()
    throw createError({ statusCode: 401, message: 'Invalid credentials.' })
  }

  // Mark code as used and clear rate limit on success
  await Promise.all([markTotpCodeUsed(code), clearRateLimit()])

  // Issue JWT cookie
  const token = await signAdminJwt()

  setCookie(event, 'admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })

  return { ok: true }
})

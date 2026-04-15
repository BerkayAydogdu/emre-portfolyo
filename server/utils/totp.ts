import { TOTP, Secret } from 'otpauth'

export function verifyTotpCode(code: string): boolean {
  const secretBase32 = process.env.ADMIN_TOTP_SECRET
  if (!secretBase32) {
    throw createError({ statusCode: 500, message: 'ADMIN_TOTP_SECRET is not set.' })
  }

  const totp = new TOTP({
    issuer: 'EmrePortfolio',
    label: 'Emre Admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  })

  // window: 1 allows ±1 step (covers clock drift)
  const delta = totp.validate({ token: code, window: 1 })
  return delta !== null
}

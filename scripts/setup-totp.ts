/**
 * Run once locally to generate your TOTP secret and QR code.
 * Usage: npx tsx scripts/setup-totp.ts
 *
 * Copy the printed ADMIN_TOTP_SECRET value into your .env file.
 * Scan the QR code with Google Authenticator.
 */
import { TOTP, Secret } from 'otpauth'
import QRCode from 'qrcode'
import crypto from 'node:crypto'

const secret = new Secret({ size: 20 })
const base32Secret = secret.base32

const totp = new TOTP({
  issuer: 'EmrePortfolio',
  label: 'Emre Admin',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  secret,
})

const otpAuthUri = totp.toString()

console.log('\n=== Emre Portfolio Admin Setup ===\n')
console.log('Add these to your .env file:\n')
console.log(`ADMIN_TOTP_SECRET="${base32Secret}"`)
console.log(`ADMIN_JWT_SECRET="${crypto.randomBytes(32).toString('hex')}"`)
console.log('\n--- Scan the QR code below with Google Authenticator ---\n')

const qr = await QRCode.toString(otpAuthUri, { type: 'terminal', small: true })
console.log(qr)

console.log('OTP Auth URI (backup):')
console.log(otpAuthUri)
console.log('\nIMPORTANT: Save the ADMIN_TOTP_SECRET now — it cannot be recovered.\n')

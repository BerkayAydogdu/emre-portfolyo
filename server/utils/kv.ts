import { createClient } from '@vercel/kv'

// Lazy KV client — only initialised when called at runtime
function getClient() {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    throw createError({
      statusCode: 500,
      message: 'KV_REST_API_URL and KV_REST_API_TOKEN must be set.',
    })
  }

  return createClient({ url, token })
}

// ── Locale helpers ────────────────────────────────────────────────────────────

export async function getLocaleFromKV(locale: 'tr' | 'en'): Promise<Record<string, unknown> | null> {
  try {
    const kv = getClient()
    return await kv.get<Record<string, unknown>>(`content:${locale}`)
  }
  catch {
    return null
  }
}

export async function setLocaleInKV(locale: 'tr' | 'en', data: Record<string, unknown>): Promise<void> {
  const kv = getClient()
  await kv.set(`content:${locale}`, data)
  await kv.set(`meta:content:${locale}:updatedAt`, new Date().toISOString())
}

export async function deleteLocaleFromKV(locale: 'tr' | 'en'): Promise<void> {
  const kv = getClient()
  await kv.del(`content:${locale}`)
  await kv.del(`meta:content:${locale}:updatedAt`)
}

// ── Portfolio data helpers ────────────────────────────────────────────────────

export async function getPortfolioDataFromKV(): Promise<Record<string, unknown> | null> {
  try {
    const kv = getClient()
    return await kv.get<Record<string, unknown>>('portfolio:data')
  }
  catch {
    return null
  }
}

export async function setPortfolioDataInKV(data: Record<string, unknown>): Promise<void> {
  const kv = getClient()
  await kv.set('portfolio:data', data)
  await kv.set('meta:portfolio:data:updatedAt', new Date().toISOString())
}

// ── Metadata helpers ──────────────────────────────────────────────────────────

export async function getContentMeta(): Promise<{
  trUpdatedAt: string | null
  enUpdatedAt: string | null
  portfolioUpdatedAt: string | null
}> {
  try {
    const kv = getClient()
    const [tr, en, portfolio] = await Promise.all([
      kv.get<string>('meta:content:tr:updatedAt'),
      kv.get<string>('meta:content:en:updatedAt'),
      kv.get<string>('meta:portfolio:data:updatedAt'),
    ])
    return { trUpdatedAt: tr, enUpdatedAt: en, portfolioUpdatedAt: portfolio }
  }
  catch {
    return { trUpdatedAt: null, enUpdatedAt: null, portfolioUpdatedAt: null }
  }
}

// ── Rate limit helpers ────────────────────────────────────────────────────────

const RATE_KEY = 'admin:auth:rateLimit'
const LOCKOUT_KEY = 'admin:auth:lockout'
const MAX_ATTEMPTS = 5
const WINDOW_SECONDS = 600  // 10 minutes
const LOCKOUT_SECONDS = 600 // 10 minutes

export async function checkRateLimit(): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const kv = getClient()
    const locked = await kv.get<string>(LOCKOUT_KEY)
    if (locked) return { allowed: false, remaining: 0 }

    const attempts = await kv.get<number>(RATE_KEY) ?? 0
    if (attempts >= MAX_ATTEMPTS) {
      await kv.set(LOCKOUT_KEY, '1', { ex: LOCKOUT_SECONDS })
      return { allowed: false, remaining: 0 }
    }

    return { allowed: true, remaining: MAX_ATTEMPTS - attempts }
  }
  catch {
    return { allowed: true, remaining: MAX_ATTEMPTS }
  }
}

export async function recordFailedAttempt(): Promise<void> {
  try {
    const kv = getClient()
    const attempts = await kv.get<number>(RATE_KEY) ?? 0
    await kv.set(RATE_KEY, attempts + 1, { ex: WINDOW_SECONDS })
  }
  catch {
    // non-fatal
  }
}

export async function clearRateLimit(): Promise<void> {
  try {
    const kv = getClient()
    await kv.del(RATE_KEY)
    await kv.del(LOCKOUT_KEY)
  }
  catch {
    // non-fatal
  }
}

// ── TOTP replay prevention ────────────────────────────────────────────────────

export async function isTotpCodeUsed(code: string): Promise<boolean> {
  try {
    const kv = getClient()
    const used = await kv.get<string>(`admin:totp:used:${code}`)
    return used === '1'
  }
  catch {
    return false
  }
}

export async function markTotpCodeUsed(code: string): Promise<void> {
  try {
    const kv = getClient()
    await kv.set(`admin:totp:used:${code}`, '1', { ex: 90 }) // one TOTP window + buffer
  }
  catch {
    // non-fatal
  }
}

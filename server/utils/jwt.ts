import { SignJWT, jwtVerify } from 'jose'

export interface AdminJwtPayload {
  sub: string
  exp: number
  iat: number
}

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw createError({ statusCode: 500, message: 'ADMIN_JWT_SECRET is not set.' })
  return new TextEncoder().encode(secret)
}

export async function signAdminJwt(): Promise<string> {
  return new SignJWT({ sub: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecret())
}

export async function verifyAdminJwt(token: string): Promise<AdminJwtPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as unknown as AdminJwtPayload
}

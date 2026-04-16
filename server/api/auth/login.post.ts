export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const username = body.username
  const password = body.password

  // Check against env var or default
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  if (username === adminUsername && password === adminPassword) {
    // Generate a simple token (in a real app, use JWT)
    const token = 'authenticated-admin-session'

    // Set cookie
    setCookie(event, 'admin_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    })

    return { success: true }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: 'Kullanıcı adı veya şifre hatalı'
    })
  }
})

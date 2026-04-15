export default defineNuxtRouteMiddleware(async (to) => {
  // Only applies to /admin/* pages (not /admin/login itself)
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') return

  try {
    await $fetch('/api/admin/auth/me')
  }
  catch {
    return navigateTo('/admin/login')
  }
})

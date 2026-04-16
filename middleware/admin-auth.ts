export default defineNuxtRouteMiddleware((to, from) => {
  const adminToken = useCookie('admin_token')

  // If token is missing and we are trying to go anywhere under /admin (except /admin/login)
  if (!adminToken.value && to.path.startsWith('/admin') && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }
})

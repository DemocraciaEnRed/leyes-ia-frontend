/**
 * Admin middleware - protects routes that require admin role
 * Redirects to home if user is not an admin
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, user, fetch: fetchSession } = useUserSession()
  
  // On client-side, check if we need to fetch session first
  if (import.meta.client && !loggedIn.value) {
    await fetchSession()
  }

  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }

  if (user.value?.role !== 'admin') {
    return navigateTo('/')
  }
})

/**
 * Auth middleware - protects routes that require authentication
 * Redirects to login page if user is not logged in
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, fetch: fetchSession } = useUserSession()

  // On client-side, check if we need to fetch session first
  if (import.meta.client && !loggedIn.value) {
    await fetchSession()
  }

  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }
})

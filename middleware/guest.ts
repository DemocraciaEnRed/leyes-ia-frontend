/**
 * Guest middleware - protects routes that should only be accessible to non-authenticated users
 * Redirects to home if user is already logged in
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, fetch: fetchSession } = useUserSession()
  
  // On client-side, check if we need to fetch session first
  if (import.meta.client && !loggedIn.value) {
    await fetchSession()
  }

  if (loggedIn.value) {
    return navigateTo('/')
  }
})

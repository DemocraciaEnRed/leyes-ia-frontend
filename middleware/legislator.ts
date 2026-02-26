/**
 * Legislator middleware - protects routes that require legislator role
 * Redirects to home if user is not a legislator
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

  if (user.value?.role !== 'legislator') {
    return navigateTo('/')
  }
})

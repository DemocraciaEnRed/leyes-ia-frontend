export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn } = useAuth()
  console.log('Auth middleware - loggedIn:', loggedIn.value)

  // If not logged in, redirect to login page
  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }
})

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, user } = useAuth()

  // First check if user is logged in
  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }

  // Then check if user has admin role
  if (user.value?.role !== 'admin') {
    return abortNavigation({
      statusCode: 403,
      message: 'Access denied. Admin role required.',
    })
  }
})

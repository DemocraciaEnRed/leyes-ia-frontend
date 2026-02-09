export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn } = useAuth()

  // If logged in, redirect to home page
  if (loggedIn.value) {
    return navigateTo('/')
  }
   
  
})

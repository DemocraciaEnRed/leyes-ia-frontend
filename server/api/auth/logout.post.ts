export default defineEventHandler(async (event) => {
  // Clear session using nuxt-auth-utils
  await clearUserSession(event)

  return {
    success: true
  }
})

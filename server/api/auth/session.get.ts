export default defineEventHandler(async (event) => {
  // Get session from nuxt-auth-utils
  const session = await getUserSession(event)
  const token = session?.secure?.token
  const user = session?.user

  if (!session || !token || !user) {
    return {
      user: null
    }
  }

  // TODO: Optionally check token expiration and refresh
  // Uncomment below for token refresh implementation:
  /*
  const isTokenExpired = (token: string): boolean => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const decoded = JSON.parse(jsonPayload)

      if (!decoded.exp) return true

      // Check if token expires in the next 5 seconds
      return decoded.exp * 1000 < Date.now() + 5000
    } catch (error) {
      return true
    }
  }

  // If token is expired or about to expire, refresh it
  if (isTokenExpired(authSession.token)) {
    try {
      const config = useRuntimeConfig()
      const response = await $fetch<{ token: string }>(`${config.public.backendUrl}/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authSession.token}`,
        },
      })

      // Update session with new token
      const updatedSession: AuthSession = {
        token: response.token,
        user: authSession.user,
      }
      await replaceUserSession(event, updatedSession as any)

      return {
        user: authSession.user,
      }
    } catch (error) {
      // If refresh fails, clear session
      await clearUserSession(event)
      return {
        user: null,
      }
    }
  }
  */

  return {
    user
  }
})

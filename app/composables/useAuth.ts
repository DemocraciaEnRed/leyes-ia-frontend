import type { LoginCredentials, SignupCredentials } from '#shared/types/authCredentials'
// import type { User } from '#shared/types/auth'


export const useAuth = () => {
  const router = useRouter()
  const {loggedIn, user, fetch: refreshSession, clear: clearSession, session} = useUserSession()
  // Fetch session from server
  // Role helpers
  const isAdmin = computed<boolean>(() => user.value?.role === 'admin')
  const isLegislator = computed<boolean>(() => user.value?.role === 'legislator')
  const isUser = computed<boolean>(() => user.value?.role === 'user')

  // Login method
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials,
      })
      
      // Refresh session to get updated user data
      await refreshSession()
      
      return response
    } catch (error) {
      throw error
    }
  }

  // Signup method
  const signup = async (credentials: SignupCredentials) => {
    try {
      const response = await $fetch('/api/auth/signup', {
        method: 'POST',
        body: credentials,
      })
      
      // Refresh session to get updated user data
      await refreshSession()
      
      return response
    } catch (error) {
      throw error
    }
  }

  // Logout method
  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      // Clear session data
      await clearSession()
      
      // Redirect to home
      await router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if logout fails
      await router.push('/')
    }
  }

  return {
    user,
    loggedIn,
    isAdmin,
    isLegislator,
    isUser,
    login,
    session,
    signup,
    logout,
    refreshSession,
  }
}

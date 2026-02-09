interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: 'user' | 'admin' | 'legislator'
}

interface AuthResponse {
  token: string
  user: User
}

interface LoginCredentials {
  email: string
  password: string
}

interface SignupCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const useAuth = () => {
  const config = useRuntimeConfig()
  const router = useRouter()
  
  const user = useState<User | null>('auth_user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  // Decode JWT to get expiration time
  const decodeToken = (token: string): { exp?: number } | null => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) return true
    
    // Check if token expires in the next 5 seconds
    return decoded.exp * 1000 < Date.now() + 5000
  }

  // Initialize auth state from localStorage
  const initAuth = () => {
    if (import.meta.client) {
      const token = localStorage.getItem(TOKEN_KEY)
      const userStr = localStorage.getItem(USER_KEY)

      if (token && userStr) {
        // Validate token
        if (isTokenExpired(token)) {
          // Token is expired, clear everything
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          user.value = null
        } else {
          // Token is valid, restore user state
          try {
            user.value = JSON.parse(userStr)
          } catch (error) {
            console.error('Error parsing user data:', error)
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
            user.value = null
          }
        }
      }
    }
  }

  // Login function
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await $fetch<AuthResponse>(`${config.public.backendUrl}/auth/login`, {
        method: 'POST',
        body: credentials
      })

      if (response.token && response.user) {
        // Store token and user in localStorage
        if (import.meta.client) {
          localStorage.setItem(TOKEN_KEY, response.token)
          localStorage.setItem(USER_KEY, JSON.stringify(response.user))
        }
        user.value = response.user
        return { success: true }
      }

      return { success: false, error: 'Invalid response from server' }
    } catch (error: any) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.data?.message || error.message || 'Login failed' 
      }
    }
  }

  // Signup function
  const signup = async (credentials: SignupCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await $fetch<AuthResponse>(`${config.public.backendUrl}/auth/signup`, {
        method: 'POST',
        body: credentials
      })

      if (response.token && response.user) {
        // Store token and user in localStorage
        if (import.meta.client) {
          localStorage.setItem(TOKEN_KEY, response.token)
          localStorage.setItem(USER_KEY, JSON.stringify(response.user))
        }
        user.value = response.user
        return { success: true }
      }

      return { success: false, error: 'Invalid response from server' }
    } catch (error: any) {
      console.error('Signup error:', error)
      return { 
        success: false, 
        error: error.data?.message || error.message || 'Signup failed' 
      }
    }
  }

  // Logout function
  const logout = () => {
    if (import.meta.client) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
    user.value = null
    router.push('/')
  }

  // Get token from localStorage
  const getToken = (): string | null => {
    if (import.meta.client) {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  }

  // Role checking helpers
  const hasRole = (role: string): boolean => {
    return user.value?.role === role
  }

  const isAdmin = (): boolean => {
    return hasRole('admin')
  }

  const isLegislator = (): boolean => {
    return hasRole('legislator')
  }

  const isUser = (): boolean => {
    return hasRole('user')
  }

  return {
    user: readonly(user),
    isAuthenticated,
    initAuth,
    login,
    signup,
    logout,
    getToken,
    hasRole,
    isAdmin,
    isLegislator,
    isUser
  }
}

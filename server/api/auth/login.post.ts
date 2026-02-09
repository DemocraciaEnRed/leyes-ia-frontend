import type { AuthResponse, LoginCredentials, AuthSession } from '#shared/types/authCredentials'
import type { UserSession } from '#auth-utils'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<LoginCredentials>(event)

  try {
    console.log("Login attempt for email:", body.email);
    console.log("Using API URL:", config.public.backendUrl);
    // Call external API to authenticate
    const response = await $fetch<AuthResponse>(`${config.public.backendUrl}/auth/login`, {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
      },
    })
    console.log("Login response received:", response);

    // Create session with token and user data
    const session: AuthSession = {
      user: response.user,
      secure: {
        token: response.token // Store token in secure cookie
      },
      loggedInAt: Date.now()
    }

    // Store session using nuxt-auth-utils (cast to any for compatibility)
    await setUserSession(event, session as any)

    // Return user data
    return {
      user: response.user,
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 401,
      message: error.data?.message || 'Invalid credentials',
    })
  }
})

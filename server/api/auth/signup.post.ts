import type { AuthResponse, SignupCredentials, AuthSession } from '#shared/types/authCredentials'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<SignupCredentials>(event)

  try {
    // Call external API to register user
    const response = await $fetch<AuthResponse>(`${config.public.backendUrl}/auth/signup`, {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        magicWord: body.magicWord,
        dateOfBirth: body.dateOfBirth,
        genre: body.genre,
        documentNumber: body.documentNumber,
        provinceId: body.provinceId,
      }
    })

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

    // Return user data (token is in httpOnly cookie)
    return {
      user: response.user
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.data?.message || 'Registration failed'
    })
  }
})

import type { AuthResponse } from '#shared/types/authCredentials'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const token = session?.secure?.token

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'No hay sesión activa'
    })
  }

  const config = useRuntimeConfig()

  try {
    const response = await $fetch<AuthResponse>(`${config.public.backendUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    await setUserSession(event, {
      user: response.user,
      secure: {
        token: response.token
      },
      loggedInAt: (session?.loggedInAt as number | undefined) || Date.now()
    })

    return {
      user: response.user
    }
  } catch (error: unknown) {
    const normalizedError = error as {
      statusCode?: number
      data?: {
        message?: string
      }
    }

    if (normalizedError?.statusCode === 401) {
      await clearUserSession(event)
    }

    throw createError({
      statusCode: normalizedError?.statusCode || 500,
      message: normalizedError?.data?.message || 'No se pudo refrescar la sesión'
    })
  }
})

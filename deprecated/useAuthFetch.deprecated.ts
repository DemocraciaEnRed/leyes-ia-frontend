import type { UseFetchOptions } from 'nuxt/app'

export function useAuthFetch<T>(url: string | (() => string), options: UseFetchOptions<T> = {}) {
  const config = useRuntimeConfig()
  const { getToken, logout } = useAuth()

  return useFetch(url, {
    ...options,
    onRequest({ options }) {
      // Add auth token to request headers
      const token = getToken()
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`
        }
      }
    },
    onResponseError({ response }) {
      // Handle 401/403 errors by logging out
      if (response.status === 401 || response.status === 403) {
        logout()
      }
    }
  })
}

export async function $authFetch<T>(url: string, options: any = {}) {
  const config = useRuntimeConfig()
  const { getToken, logout } = useAuth()

  try {
    const token = getToken()

    return await $fetch<T>(url, {
      ...options,
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
  } catch (error: any) {
    // Handle 401/403 errors
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      logout()
    }
    throw error
  }
}

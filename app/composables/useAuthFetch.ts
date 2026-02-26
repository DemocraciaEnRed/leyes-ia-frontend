import type { UseFetchOptions } from 'nuxt/app'

/**
 * Composable for making authenticated API requests through the server proxy.
 *
 * The JWT token is stored securely in the session (httpOnly cookie) and is
 * automatically attached to requests by the server proxy at /api/backend/[...].
 *
 * This means the token is NEVER exposed to the client-side JavaScript.
 *
 * @example
 * // GET request
 * const { data } = await useAuthFetch('/api/backend/projects')
 *
 * @example
 * // With type parameter
 * interface Project { id: string; name: string }
 * const { data } = await useAuthFetch<Project[]>('/api/backend/projects')
 *
 * @example
 * // With options
 * const { data } = await useAuthFetch('/api/backend/projects', {
 *   query: { page: 1, limit: 10 }
 * })
 */
export function useAuthFetch<T>(
  url: string,
  options?: Omit<UseFetchOptions<T>, 'default'>
) {
  const { clear } = useUserSession()

  return useFetch<T>(url, {
    ...options,
    onResponseError({ response }) {
      // Handle 401 errors by clearing the session
      if (response.status === 401) {
        clear()
        navigateTo('/auth/login')
      }
    }
  } as any)
}

/**
 * Function for making authenticated imperative API requests through the server proxy.
 *
 * Use this for POST, PUT, DELETE operations or when you need imperative control.
 *
 * @example
 * // POST request
 * const newProject = await $authFetch('/api/backend/projects', {
 *   method: 'POST',
 *   body: { name: 'My Project' }
 * })
 *
 * @example
 * // DELETE request
 * await $authFetch('/api/backend/projects/123', { method: 'DELETE' })
 */
export const $authFetch = async <T>(url: string, options: any = {}): Promise<T> => {
  const { clear } = useUserSession()

  try {
    return await $fetch<T>(url, options)
  } catch (error: any) {
    // Handle 401 errors by clearing the session
    if (error?.response?.status === 401 || error?.statusCode === 401) {
      await clear()
      await navigateTo('/auth/login')
    }
    throw error
  }
}

/**
 * Catch-all proxy route for the Express backend API
 * 
 * This route:
 * 1. Requires user to be authenticated (has a valid session)
 * 2. Gets the JWT token from the secure session (not accessible on client)
 * 3. Forwards the request to the Express backend with the Authorization header
 * 
 * Usage from client:
 *   $fetch('/api/backend/projects')        -> GET  {apiUrl}/projects
 *   $fetch('/api/backend/projects/123')    -> GET  {apiUrl}/projects/123
 *   $fetch('/api/backend/projects', { method: 'POST', body: {...} }) -> POST {apiUrl}/projects
 */
export default defineEventHandler(async (event) => {
  // Require authenticated session - throws 401 if not authenticated
  const session = await requireUserSession(event)
  
  // Get the JWT token from the secure session data
  const { token } = session.secure || {}
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'No authentication token found'
    })
  }

  // Get the path after /api/backend/
  const path = event.path.replace(/^\/api\/backend/, '') || '/'
  
  // Get the backend API URL from runtime config
  const config = useRuntimeConfig()
  const backendUrl = `${config.public.backendUrl}${path}`

  // Get request method and body
  const method = event.method
  let body = undefined
  
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    body = await readBody(event)
  }

  // Get query parameters
  const query = getQuery(event)

  // Forward the request to the Express backend
  try {
    const response = await $fetch(backendUrl, {
      method,
      body,
      query,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return response
  } catch (error: any) {
    // If backend returns 401/403, clear the session and return error
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      await clearUserSession(event)
      throw createError({
        statusCode: 401,
        message: 'Session expired'
      })
    }

    // Re-throw other errors
    throw createError({
      statusCode: error?.response?.status || 500,
      message: error?.data?.message || error?.message || 'Backend request failed'
    })
  }
})

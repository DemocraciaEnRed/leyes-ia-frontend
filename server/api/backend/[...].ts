/**
 * Catch-all proxy route for the Express backend API
 *
 * This route uses proxyRequest to transparently forward the entire incoming
 * request (method, headers, body stream, query params) to the Express backend.
 * This means it works with ANY content type (JSON, FormData/multipart, etc.)
 * without needing to parse or re-encode the body.
 *
 * If the user is authenticated, the Authorization header is injected automatically.
 *
 * Usage from client:
 *   $fetch('/api/backend/projects')        -> GET  {apiUrl}/projects
 *   $fetch('/api/backend/projects/123')    -> GET  {apiUrl}/projects/123
 *   $fetch('/api/backend/projects', { method: 'POST', body: formData }) -> POST {apiUrl}/projects
 */
export default defineEventHandler(async (event) => {
  // Try to get an authenticated session if present (optional)
  const session = await getUserSession(event)
  console.log('Proxying request with session:', session)
  const token = session?.secure?.token

  // Build target URL
  const path = event.path.replace(/^\/api\/backend/, '') || '/'
  const config = useRuntimeConfig()
  const target = `${config.public.backendUrl}${path}`

  // Build extra headers to inject (only Authorization when authenticated)
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Proxy the request as-is (preserves method, body stream, content-type, query, etc.)
  return proxyRequest(event, target, {
    headers
  })
})

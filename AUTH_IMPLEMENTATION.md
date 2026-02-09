# Authentication Implementation with nuxt-auth-utils

This project uses `nuxt-auth-utils` for authentication with JWT tokens from an external Express API.

## Overview

- **External API**: Configured via `NUXT_BACKEND_URL` environment variable (Express backend)
- **Session Storage**: Server-side sessions using `nuxt-auth-utils` with httpOnly cookies
- **JWT Handling**: JWT tokens are stored in the **secure** part of the session (never exposed to client JS)
- **Proxy Pattern**: All authenticated API calls go through `/api/backend/[...]` which injects the JWT
- **Role-Based Access**: Middleware for `guest`, `auth`, `admin`, and `legislator` roles

## How It Works

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LOGIN FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. User submits login form                                                  │
│     ↓                                                                        │
│  2. Client calls POST /api/auth/login (Nuxt server route)                   │
│     ↓                                                                        │
│  3. Nuxt server calls Express backend POST /auth/login                      │
│     ↓                                                                        │
│  4. Express returns { token: "jwt...", user: {...} }                        │
│     ↓                                                                        │
│  5. Nuxt server stores token in session.secure (httpOnly cookie)            │
│     ↓                                                                        │
│  6. Client receives user data (token is NOT sent to client)                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Authenticated API Requests

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATED REQUEST FLOW                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Client calls /api/backend/projects (Nuxt proxy route)                   │
│     ↓                                                                        │
│  2. Nuxt server extracts JWT from session.secure                            │
│     ↓                                                                        │
│  3. Nuxt server calls Express: GET /projects                                │
│     with header: Authorization: Bearer <jwt>                                 │
│     ↓                                                                        │
│  4. Express validates JWT and returns data                                  │
│     ↓                                                                        │
│  5. Nuxt server forwards response to client                                 │
│                                                                              │
│  ⚠️  The JWT token NEVER reaches the client browser!                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Architecture

### Server API Routes

#### Authentication (`server/api/auth/`)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/login` | POST | Authenticates with Express, stores JWT in secure session |
| `/api/auth/signup` | POST | Registers with Express, stores JWT in secure session |
| `/api/auth/logout` | POST | Clears the server session |
| `/api/auth/session` | GET | Returns current user from session |

#### Backend Proxy (`server/api/backend/`)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/backend/[...]` | ALL | Catch-all proxy that injects JWT and forwards to Express |

**Example mappings:**
- `GET /api/backend/projects` → `GET {EXPRESS_URL}/projects`
- `POST /api/backend/projects` → `POST {EXPRESS_URL}/projects`
- `GET /api/backend/projects/123` → `GET {EXPRESS_URL}/projects/123`
- `DELETE /api/backend/users/456` → `DELETE {EXPRESS_URL}/users/456`

### Composables

#### `useAuth()`

Main authentication composable that wraps `useUserSession()`:

```typescript
const { 
  user,           // ComputedRef<User | null> - current user data
  loggedIn,       // ComputedRef<boolean> - is user authenticated
  isAdmin,        // ComputedRef<boolean> - has admin role
  isLegislator,   // ComputedRef<boolean> - has legislator role
  isUser,         // ComputedRef<boolean> - has user role
  login,          // (credentials) => Promise - login and create session
  signup,         // (credentials) => Promise - register and create session
  logout,         // () => Promise - clear session and redirect to home
  refreshSession, // () => Promise - refresh session from server
  session         // Ref<UserSession> - full session object
} = useAuth()
```

#### `useAuthFetch()`

For making authenticated GET requests with reactive data:

```typescript
// Basic usage
const { data, pending, error, refresh } = await useAuthFetch('/api/backend/projects')

// With type parameter
interface Project { id: string; name: string; status: string }
const { data: projects } = await useAuthFetch<Project[]>('/api/backend/projects')

// With query parameters
const { data } = await useAuthFetch('/api/backend/projects', {
  query: { page: 1, limit: 10, status: 'active' }
})

// Lazy loading (doesn't block navigation)
const { data, pending } = await useAuthFetch('/api/backend/projects', { 
  lazy: true 
})
```

#### `$authFetch()`

For imperative requests (POST, PUT, DELETE):

```typescript
// Create a new project
const newProject = await $authFetch('/api/backend/projects', {
  method: 'POST',
  body: { 
    name: 'My Project',
    description: 'A new legislative project'
  }
})

// Update a project
await $authFetch('/api/backend/projects/123', {
  method: 'PUT',
  body: { name: 'Updated Name' }
})

// Delete a project
await $authFetch('/api/backend/projects/123', { 
  method: 'DELETE' 
})

// With query parameters
const results = await $authFetch('/api/backend/search', {
  method: 'GET',
  query: { q: 'legislative reform' }
})
```

### Middleware

| Middleware | Description | Redirects to |
|------------|-------------|--------------|
| `auth` | Requires authenticated user | `/auth/login` |
| `guest` | Requires NO authenticated user | `/` |
| `admin` | Requires `admin` role | `/` |
| `legislator` | Requires `legislator` role | `/` |

### Using Middleware in Pages

```vue
<script setup>
// Single middleware
definePageMeta({
  middleware: 'auth'
})
</script>
```

```vue
<script setup>
// Multiple middleware (checked in order)
definePageMeta({
  middleware: ['auth', 'admin']
})
</script>
```

```vue
<script setup>
// With layout
definePageMeta({
  layout: 'workspace',
  middleware: 'auth'
})
</script>
```

## Usage Examples

### Login Page

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const { login } = useAuth()
const toast = useToast()

const handleLogin = async (formData) => {
  try {
    await login({
      email: formData.email,
      password: formData.password
    })
    
    toast.add({ title: 'Welcome back!', color: 'success' })
    await navigateTo('/workspaces')
  } catch (error) {
    toast.add({ 
      title: 'Login failed', 
      description: error.data?.message,
      color: 'error' 
    })
  }
}
</script>
```

### Protected Page with Data Fetching

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

// Fetch user's projects
const { data: projects, pending, refresh } = await useAuthFetch('/api/backend/projects')

// Create new project
const createProject = async (name: string) => {
  const newProject = await $authFetch('/api/backend/projects', {
    method: 'POST',
    body: { name }
  })
  
  // Refresh the list
  await refresh()
}
</script>

<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else>
      <div v-for="project in projects" :key="project.id">
        {{ project.name }}
      </div>
    </div>
  </div>
</template>
```

### Header with Auth State

```vue
<script setup lang="ts">
const { user, loggedIn, logout, isAdmin, isLegislator } = useAuth()

const menuItems = computed(() => {
  if (!loggedIn.value) {
    return [[
      { label: 'Login', to: '/auth/login' },
      { label: 'Sign up', to: '/auth/signup' }
    ]]
  }

  return [
    [{ label: user.value?.fullName, type: 'label' }],
    [
      { label: 'My Workspaces', to: '/workspaces' },
      { label: 'Profile', to: '/user/profile' }
    ],
    // Show admin link only for admins
    ...(isAdmin.value ? [[{ label: 'Admin Dashboard', to: '/admin/dashboard' }]] : []),
    // Show legislator link only for legislators
    ...(isLegislator.value ? [[{ label: 'Proposals', to: '/legislator/proposals' }]] : []),
    [{ label: 'Logout', click: logout }]
  ]
})
</script>
```

### Role-Based Content in Templates

```vue
<template>
  <div>
    <!-- Show to all authenticated users -->
    <div v-if="loggedIn">
      Welcome, {{ user?.fullName }}!
    </div>

    <!-- Show only to admins -->
    <AdminPanel v-if="isAdmin" />

    <!-- Show only to legislators -->
    <LegislatorTools v-if="isLegislator" />

    <!-- Show to guests only -->
    <div v-if="!loggedIn">
      <NuxtLink to="/auth/login">Please log in</NuxtLink>
    </div>
  </div>
</template>
```

## Type Definitions

### User Type (`shared/types/auth.d.ts`)

```typescript
declare module '#auth-utils' {
  interface User {
    id: number
    firstName: string
    lastName: string
    fullName: string
    role: 'user' | 'admin' | 'legislator'
    imageUrl: string | null
    email?: string
  }

  interface SecureSessionData {
    token: string  // JWT token - only accessible on server
  }

  interface UserSession {
    id: string
    user?: User
    secure?: SecureSessionData
    loggedInAt?: number
  }
}
```

### Credentials Types (`shared/types/authCredentials.d.ts`)

```typescript
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

interface AuthResponse {
  token: string
  user: User
}
```

## Protected Routes Summary

| Route Pattern | Middleware | Access |
|--------------|------------|--------|
| `/auth/login` | `guest` | Non-authenticated only |
| `/auth/signup` | `guest` | Non-authenticated only |
| `/workspaces/*` | `auth` | All authenticated users |
| `/user/*` | `auth` | All authenticated users |
| `/chat/*` | `auth` | All authenticated users |
| `/admin/dashboard` | `admin` | Admins only |
| `/legislator/proposals` | `legislator` | Legislators only |

## External API Contract

Your Express backend should provide these endpoints:

### Authentication Endpoints

```
POST /auth/login
Body: { email: string, password: string }
Response: { token: string, user: User }

POST /auth/signup
Body: { email: string, password: string, firstName: string, lastName: string }
Response: { token: string, user: User }
```

### Protected Endpoints

All other endpoints should:
1. Accept `Authorization: Bearer <jwt>` header
2. Return 401 if token is invalid/expired
3. Return appropriate data for the authenticated user

## Environment Variables

```env
# Required
NUXT_BACKEND_URL=http://localhost:4000    # Express backend URL
NUXT_SESSION_PASSWORD=your-32-char-secret     # Session encryption key

# Optional
NITRO_PORT=3000                               # Nuxt server port
```

> **Note**: `nuxt-auth-utils` will auto-generate `NUXT_SESSION_PASSWORD` in development if not set.

## Security Features

1. **httpOnly Cookies**: JWT tokens stored in cookies not accessible to JavaScript
2. **Secure Session**: Token stored in `session.secure` - only accessible on server
3. **Automatic 401 Handling**: Sessions cleared and user redirected on auth errors
4. **No Token Exposure**: JWT never sent to or stored on the client
5. **CSRF Protection**: Built into `nuxt-auth-utils`

## Troubleshooting

### "401 Unauthorized" on protected routes
- Check that your Express backend is running
- Verify `NUXT_BACKEND_URL` is correct
- Check browser cookies for `nuxt-session`

### Session not persisting
- Ensure `NUXT_SESSION_PASSWORD` is set (32+ characters)
- Check that cookies are enabled in browser

### Role-based routes not working
- Verify the `role` field is returned by your Express `/auth/login` endpoint
- Check that middleware is applied: `definePageMeta({ middleware: 'admin' })`

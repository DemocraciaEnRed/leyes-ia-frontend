# Copilot Instructions for leyes-ia-frontend

## Scope
- This file is frontend-only. Backend-specific instructions live in `leyes-ia-backend/.github/copilot-instructions.md`.
- Frontend stack: Nuxt 4 + Nuxt UI (`app/` source tree).
- Frontend must talk to backend through Nuxt server routes, not directly from browser code.

## Frontend patterns (Nuxt)
- Use `app/` as canonical app source (`app/pages`, `app/components`, `app/layouts`, `app/middleware`).
- Auth is session-based via `nuxt-auth-utils`; JWT is stored in `session.secure.token` on server.
- For API calls from pages/components:
  - Prefer `useAuthFetch('/api/backend/...')` for reactive GETs.
  - Prefer `$authFetch('/api/backend/...')` for POST/PUT/PATCH/DELETE.
  - Do not call `${NUXT_BACKEND_URL}` directly from client components.
- Backend proxy is `server/api/backend/[...].ts` (injects `Authorization: Bearer <token>` when session exists).
- Auth entry points are `server/api/auth/login.post.ts`, `signup.post.ts`, `logout.post.ts`.

## Route and navigation conventions
- Canonical public routes: `/proyectos` and `/proyectos/:projectSlug`.
- Canonical management routes: `/proyectos/panel/...`.
- Legacy `/legislador/hubs/...` routes are aliases added in `nuxt.config.ts` (`hooks.pages:extend`).
- Project dashboard pages use `layout: 'workspace'` + middleware (example: `app/pages/proyectos/panel/[projectId]/index.vue`).

## Dev workflow and validation
- Use Node version from `.nvmrc` (`v22.20.0`): run `nvm use` before installs.
- Frontend commands: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`.

## Change guidance for AI agents
- Reuse existing middleware names (`auth`, `guest`, `admin`, `legislator`) instead of introducing new auth gates.
- Follow existing Nuxt UI-first page composition (`UPage*`, `UContainer`, `UAlert`, etc.) instead of custom UI systems.
- Preserve route compatibility: do not remove legacy aliases without coordinated migration.
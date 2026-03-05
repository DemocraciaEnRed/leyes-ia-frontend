# Survey Response Flow (Frontend)

Este documento resume la integración frontend del flujo de respuesta de encuestas.

## Página principal del flujo

- Ruta: `/proyectos/:projectSlug/encuestas/:surveyId`
- Archivo: `app/pages/proyectos/[projectSlug]/encuestas/[surveyId].vue`

## Carga inicial

La página consulta en paralelo:

1. Estructura de encuesta:
- `GET /api/backend/hub/projects/slug/:projectSlug/surveys/:surveyId`

2. Elegibilidad de encuestado:
- `GET /api/backend/hub/projects/slug/:projectSlug/surveys/:surveyId/respondent-eligibility`

> Se usa `$fetch` (no `useAuthFetch`) para no redirigir a login en escenarios anónimos.

## Modos de respuesta

### Usuario logueado

- Si `eligible = true`: responde encuesta directamente.
- Si `eligible = false` y `code = "ALREADY_RESPONDED"`:
  - Se muestra estado de "ya participaste".
  - No se habilita nuevamente el formulario de preguntas.
- Si `eligible = false` y faltan campos de perfil:
  - Se abre modal de completitud de perfil.
  - Componente: `app/components/survey/ProfileCompletionModal.vue`
  - Guarda vía: `PATCH /api/backend/users/me/profile`
  - Refresca sesión y vuelve a consultar elegibilidad.

### Usuario anónimo

- Si `allowAnonymousResponses = true`:
  - Debe completar antes de empezar:
    - fecha de nacimiento
    - género
    - provincia
    - número de documento
- Si no permite anónimos:
  - Se muestra CTA para iniciar sesión.

## Texto de privacidad en DNI (anónimo)

En el campo DNI del gate anónimo se muestra una ayuda explícita:

- El dato se usa para evitar respuestas duplicadas.
- Se almacena internamente.
- No se comparte con el legislador.

## Render de preguntas y envío

Componentes:
- `app/components/survey/Wrapper.vue`
- `app/components/survey/Card.vue`

Soporta tipos:
- `single-choice`
- `multiple-choice`
- `rating`
- `open-ended`
- `openTextEnabled` opcional para comentarios adicionales.

El submit envía:
- `POST /api/backend/projects/:projectId/surveys/:surveyId/responses`
- Payload con `answers` estructurado por pregunta y datos demográficos si anónimo.

## Manejo de errores UX

`Wrapper.vue` mapea códigos backend a mensajes amigables:
- `ALREADY_RESPONDED` (vía elegibilidad previa al submit)
- `DUPLICATE_RESPONSE_USER`
- `DUPLICATE_RESPONSE_DOCUMENT`
- `PROFILE_INCOMPLETE`
- `INVALID_RESPONDENT_DATA`
- `INVALID_ANSWERS`
- `SURVEY_UNAVAILABLE`
- `AUTH_REQUIRED`

## Entrada al flujo desde detalle de proyecto

Componente: `app/components/project-detail/SurveysSection.vue`

- Encuesta destacada: botón `Responder encuesta`.
- Carrusel de encuestas: botón `Responder` por tarjeta.

Ambos navegan a:
- `/proyectos/:projectSlug/encuestas/:surveyId`

## Nota de evolución

Queda prevista una futura vinculación entre respuestas históricas anónimas y cuenta registrada, según definiciones de privacidad y producto.
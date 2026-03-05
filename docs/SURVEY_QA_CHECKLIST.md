# Survey QA Checklist (Frontend/E2E)

Checklist manual para validar UX del flujo de respuesta de encuestas.

## Preparación

- [ ] Frontend y backend levantados.
- [ ] Proyecto público con encuesta activa accesible desde `/proyectos/:projectSlug`.
- [ ] Usuario de prueba con perfil completo y otro incompleto.

## Navegación

- [ ] Desde `SurveysSection` el botón `Responder encuesta` abre `/proyectos/:projectSlug/encuestas/:surveyId`.
- [ ] El botón `Responder` en cards del carrusel abre la misma ruta correctamente.

## Estados de carga

- [ ] Se muestra estado de carga al abrir encuesta.
- [ ] Se muestra error entendible si la encuesta no existe o no está disponible.

## Flujo logueado

- [ ] Usuario con perfil completo entra directamente al formulario de preguntas.
- [ ] Usuario con perfil incompleto ve modal de completitud.
- [ ] Al guardar perfil, se refresca sesión y habilita la encuesta sin salir de la página.
- [ ] Si el usuario ya respondió, se muestra estado "ya participaste" y no se habilita responder otra vez.

## Flujo anónimo

- [ ] Se solicita fecha de nacimiento, género, provincia y DNI antes de comenzar.
- [ ] Debajo de DNI aparece texto de privacidad (uso interno, no compartido con legislador).
- [ ] Sin completar esos datos no permite continuar.

## Preguntas y validación

- [ ] Render correcto de tipos `single-choice`, `multiple-choice`, `rating`, `open-ended`.
- [ ] Pregunta obligatoria no permite avanzar sin respuesta.
- [ ] Campo de comentario opcional aparece cuando `openTextEnabled` está activo.

## Envío y errores

- [ ] Submit exitoso muestra estado de finalización.
- [ ] Duplicado logueado muestra mensaje amigable de ya respondida.
- [ ] Duplicado anónimo por DNI muestra mensaje amigable de duplicado.
- [ ] Errores de validación (`INVALID_ANSWERS`, `INVALID_RESPONDENT_DATA`) muestran copy claro.

## Regresión rápida

- [ ] `pnpm typecheck` en frontend sin errores.
- [ ] Navegación de retorno (logo + modal de salida) sigue funcionando.
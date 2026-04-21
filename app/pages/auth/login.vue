<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

import * as z from 'zod'

type Schema = z.output<typeof schema>

definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

const { login, isLegislator } = useAuth()

const toast = useToast()

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Correo electrónico',
  placeholder: 'Ingrese su correo electrónico',
  required: true
}, {
  name: 'password',
  label: 'Contraseña',
  type: 'password',
  placeholder: 'Ingrese su contraseña',
  required: true
}]

const schema = z.object({
  email: z.email('Correo electrónico inválido'),
  password: z.string('Ingrese su contraseña').min(8, 'Debe tener al menos 8 caracteres')
})

const handleLogin = async (event: FormSubmitEvent<Schema>) => {
  try {
    await login({
      email: event.data.email,
      password: event.data.password
    })

    // Redirigir a Mis proyectos después de login exitoso
    toast.add({
      title: 'Inicio de sesión exitoso',
      description: '¡Bienvenido de nuevo!',
      icon: 'lucide:check-circle',
      color: 'success'
    })

    await navigateTo(isLegislator.value ? '/cuenta/proyectos' : '/proyectos')
  } catch (error: unknown) {
    const normalizedError = error as { data?: { message?: string }, message?: string }
    toast.add({
      title: 'Error de inicio de sesión',
      description: normalizedError.data?.message || normalizedError.message || 'Credenciales inválidas',
      icon: 'lucide:alert-circle',
      color: 'error'
    })
  }
}
</script>

<template>
    <UContainer>
      <UPageCard
        class="w-full max-w-md mx-auto mt-20"
        variant="subtle"
      >
        <UAuthForm
          :schema="schema"
          title="Iniciar sesión"
          description="Ingrese sus credenciales para acceder a su cuenta."
          icon="lucide:user-circle"
          :fields="fields"
          :submit="{ label: 'Iniciar sesión', block: true, icon: 'lucide:log-in' }"
          @submit="handleLogin"
        />

        <p class="mt-4 text-center text-sm text-toned">
          ¿No tenés cuenta?
          <NuxtLink
            to="/auth/signup"
            class="font-medium text-primary hover:underline"
          >
            Creá tu cuenta
          </NuxtLink>
        </p>
      </UPageCard>
    </UContainer>
</template>

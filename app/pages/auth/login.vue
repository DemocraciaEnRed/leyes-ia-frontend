<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
type Schema = z.output<typeof schema>

definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

import * as z from 'zod'

const { login } = useAuth()
const router = useRouter()

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

    // Redirigir a hubs después de login exitoso
    toast.add({
      title: 'Inicio de sesión exitoso',
      description: '¡Bienvenido de nuevo!',
      icon: 'lucide:check-circle',
      color: 'success'
    })

    await navigateTo('/legislador/hubs')
  } catch (error: any) {
    toast.add({
      title: 'Error de inicio de sesión',
      description: error.data?.message || 'Credenciales inválidas',
      icon: 'lucide:alert-circle',
      color: 'error'
    })
  }
}
</script>

<template>
  <NuxtLayout>

    <UContainer>
      <UPageCard class="w-full max-w-md mx-auto mt-20" variant="subtle">
        <UAuthForm :schema="schema" title="Iniciar sesión"
          description="Ingrese sus credenciales para acceder a su cuenta." icon="lucide:user-circle" :fields="fields"
          @submit="handleLogin" :submit="{ label: 'Iniciar sesión', block: true, icon: 'lucide:log-in' }" />
      </UPageCard>
    </UContainer>
  </NuxtLayout>
</template>

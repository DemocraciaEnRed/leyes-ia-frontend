<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

type Schema = z.output<typeof schema>

definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

const { signup, isLegislator } = useAuth()
const toast = useToast()

const schema = z.object({
  email: z.email('Correo electrónico inválido'),
  password: z.string('La contraseña es obligatoria').min(8, 'Debe tener al menos 8 caracteres'),
  firstName: z.string('El nombre es obligatorio').min(1, 'El nombre es obligatorio'),
  lastName: z.string('El apellido es obligatorio').min(1, 'El apellido es obligatorio'),
  dateOfBirth: z.string().optional(),
  genre: z.enum(['masculino', 'femenino', 'no_binario', 'otro', 'prefiero_no_decir']).optional(),
  provinceId: z.number().int().min(1).optional(),
  confirmPassword: z.string('Por favor confirma tu contraseña').min(8, 'Debe tener al menos 8 caracteres')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'] // path of error
})

const isLoading = ref(false)
const error = ref('')
const { data: provincesResponse } = await useFetch<{ provinces: Array<{ id: number, code: string, name: string }> }>('/api/backend/utils/provinces')

const GENRE_OPTIONS = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Femenino', value: 'femenino' },
  { label: 'No binario', value: 'no_binario' },
  { label: 'Otro', value: 'otro' },
  { label: 'Prefiero no decirlo', value: 'prefiero_no_decir' }
]

const PROVINCE_OPTIONS = computed(() => {
  return (provincesResponse.value?.provinces || []).map((province) => ({
    label: province.name,
    value: province.id
  }))
})

const formState = reactive<Partial<Schema>>({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  genre: undefined,
  provinceId: undefined,
  confirmPassword: ''
})

const handleSignup = async (event: FormSubmitEvent<Schema>) => {
  error.value = ''
  isLoading.value = true

  try {
    await signup({
      firstName: event.data.firstName,
      lastName: event.data.lastName,
      email: event.data.email,
      password: event.data.password,
      dateOfBirth: event.data.dateOfBirth,
      genre: event.data.genre,
      provinceId: event.data.provinceId
    })

    // Show success message
    toast.add({
      title: 'Cuenta creada exitosamente',
      description: '¡Bienvenido! Tu cuenta ha sido creada.',
      icon: 'lucide:check-circle',
      color: 'success'
    })

    await navigateTo(isLegislator.value ? '/cuenta/proyectos' : '/proyectos')
  } catch (err: any) {
    error.value = err.data?.message || 'Error al crear la cuenta'
    toast.add({
      title: 'Error al crear cuenta',
      description: error.value,
      icon: 'lucide:alert-circle',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <NuxtLayout name="default">
    <UContainer>
      <UPageCard
        class="w-full max-w-2xl mx-auto mt-20"
        variant="subtle"
      >
        <div>
          <h2 class="text-center text-3xl font-bold">
            Creá tu cuenta
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tenés una cuenta?
            <NuxtLink
              to="/auth/login"
              class="font-medium text-primary hover:underline"
            >
              Iniciá sesión
            </NuxtLink>
          </p>
        </div>

        <UForm
          :schema="schema"
          :state="formState"
          class="space-y-6"
          @submit="handleSignup"
        >
          <div class="grid grid-cols-2 gap-4">
            <UFormField
              label="Nombres"
              name="firstName"
              required
            >
              <UInput
                v-model="formState.firstName"
                type="text"
                placeholder="John"
                required
                autocomplete="given-name"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Apellidos"
              name="lastName"
              required
            >
              <UInput
                v-model="formState.lastName"
                type="text"
                placeholder="Doe"
                required
                autocomplete="family-name"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField
            label="Correo electrónico"
            name="email"
            required
          >
            <UInput
              v-model="formState.email"
              type="email"
              placeholder="you@example.com"
              required
              autocomplete="email"
              class="w-full"
            />
          </UFormField>

          <div class="rounded-lg border border-default p-4 space-y-4">
            <p class="text-sm text-toned">
              <strong>Opcional</strong> (Estos datos son requeridos para completar encuestas. Podés completar después estos campos en tu perfil o contestando tu primera encuesta.)
            </p>

            <div class="grid grid-cols-2 gap-4">
              <UFormField
                label="Fecha de nacimiento"
                name="dateOfBirth"
              >
                <UInput
                  v-model="formState.dateOfBirth"
                  type="date"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Género"
                name="genre"
              >
                <USelect
                  v-model="formState.genre"
                  :items="GENRE_OPTIONS"
                  class="w-full"
                  placeholder="Seleccioná una opción"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 gap-4">
              <UFormField
                label="Provincia"
                name="provinceId"
              >
                <USelect
                  v-model="formState.provinceId"
                  :items="PROVINCE_OPTIONS"
                  class="w-full"
                  placeholder="Seleccioná una provincia"
                />
              </UFormField>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormField
              label="Contraseña"
              name="password"
              required
            >
              <UInput
                v-model="formState.password"
                type="password"
                required
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Confirmar contraseña"
              name="confirmPassword"
              required
            >
              <UInput
                v-model="formState.confirmPassword"
                type="password"
                required
                class="w-full"
              />
            </UFormField>
          </div>
          <UButton
            type="submit"
            block
            :loading="isLoading"
          >
            Crear cuenta
          </UButton>
        </UForm>
      </UPageCard>
    </UContainer>
  </NuxtLayout>
</template>

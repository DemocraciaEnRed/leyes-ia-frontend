<script setup lang="ts">
type Schema = z.output<typeof schema>
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
    layout: 'default',
    middleware: 'guest'
})

const { signup } = useAuth()
const router = useRouter()
const toast = useToast()

const schema = z.object({
    email: z.email('Correo electrónico inválido'),
    password: z.string('La contraseña es obligatoria').min(8, 'Debe tener al menos 8 caracteres'),
    firstName: z.string('El nombre es obligatorio').min(1, 'El nombre es obligatorio'),
    lastName: z.string('El apellido es obligatorio').min(1, 'El apellido es obligatorio'),
    confirmPassword: z.string('Por favor confirma tu contraseña').min(8, 'Debe tener al menos 8 caracteres'),   
    magicWord: z.string('La palabra mágica es obligatoria').min(1, 'La palabra mágica es obligatoria')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], // path of error
});

const isLoading = ref(false)
const error = ref('')
const formState = reactive<Partial<Schema>>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
    magicWord: ''
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
            magicWord: event.data.magicWord
        })

        // Show success message
        toast.add({
            title: 'Cuenta creada exitosamente',
            description: '¡Bienvenido! Tu cuenta ha sido creada.',
            icon: 'lucide:check-circle',
            color: 'success'
        })

        // Redirigir a hubs después de registro exitoso
        await router.push('/legislador/hubs')
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
            <UPageCard class="w-full max-w-2xl mx-auto mt-20" variant="subtle">
                <div>
                    <h2 class="text-center text-3xl font-bold">
                        Creá tu cuenta
                    </h2>
                    <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        ¿Ya tenés una cuenta?
                        <NuxtLink to="/auth/login" class="font-medium text-primary hover:underline">
                            Iniciá sesión
                        </NuxtLink>
                    </p>
                </div>

                <UForm :schema="schema" :state="formState" @submit="handleSignup"  class="space-y-6">

                    <div class="grid grid-cols-2 gap-4">
                        <UFormField label="Nombres" name="firstName" required>
                            <UInput v-model="formState.firstName" type="text" placeholder="John" required autocomplete="given-name" class="w-full" />
                        </UFormField>

                        <UFormField label="Apellidos" name="lastName" required>
                            <UInput v-model="formState.lastName" type="text" placeholder="Doe" required autocomplete="family-name" class="w-full" />
                        </UFormField>
                    </div>

                    <UFormField label="Correo electrónico" name="email" required>
                        <UInput v-model="formState.email" type="email" placeholder="you@example.com" required autocomplete="email" class="w-full"
                         />
                    </UFormField>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <UFormField label="Contraseña" name="password" required>
                            <UInput v-model="formState.password" type="password"  required  class="w-full" />
                        </UFormField>

                        <UFormField label="Confirmar contraseña" name="confirmPassword" required>
                            <UInput v-model="formState.confirmPassword" type="password"  required class="w-full" />
                        </UFormField>
                    </div>
                    <UFormField label="¿Cual es la palabra mágica?" name="magicWord" required>
                        <UInput v-model="formState.magicWord" type="text" placeholder="La palabra mágica es..." required class="w-full" />
                    </UFormField>    
                        <UButton type="submit" block :loading="isLoading">
                            Crear cuenta
                    </UButton>
                </UForm>
            </UPageCard>
        </UContainer>
    </NuxtLayout>
</template>

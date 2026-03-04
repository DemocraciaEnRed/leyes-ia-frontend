<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const toast = useToast()
const { user } = useAuth()

const GENRE_OPTIONS = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Femenino', value: 'femenino' },
  { label: 'No binario', value: 'no_binario' },
  { label: 'Otro', value: 'otro' },
  { label: 'Prefiero no decirlo', value: 'prefiero_no_decir' }
]

const { data: provincesResponse } = await useFetch<{ provinces: Array<{ id: number, code: string, name: string }> }>('/api/backend/utils/provinces')

const PROVINCE_OPTIONS = computed(() => {
  return (provincesResponse.value?.provinces || []).map((province) => ({
    label: province.name,
    value: province.id
  }))
})

const submitting = ref(false)

const { data: profileResponse, refresh: refreshProfile } = await useAuthFetch<{ user: {
  dateOfBirth?: string | null
  genre?: string | null
  documentNumber?: string | null
  provinceId?: number | null
  surveyProfileLocks?: {
    dateOfBirthLockedAt?: string | null
    genreLockedAt?: string | null
    documentNumberLockedAt?: string | null
    provinceLockedAt?: string | null
  }
} }>('/api/backend/users/me/profile')

const profileForm = reactive({
  dateOfBirth: '',
  genre: '',
  documentNumber: '',
  provinceId: undefined as number | undefined
})

watch(profileResponse, (value) => {
  profileForm.dateOfBirth = value?.user?.dateOfBirth || ''
  profileForm.genre = value?.user?.genre || ''
  profileForm.documentNumber = value?.user?.documentNumber || ''
  profileForm.provinceId = value?.user?.provinceId ?? undefined
}, { immediate: true })

const surveyLocks = computed(() => {
  const locks = profileResponse.value?.user?.surveyProfileLocks || {}
  return {
    dateOfBirthLocked: Boolean(locks.dateOfBirthLockedAt || profileResponse.value?.user?.dateOfBirth),
    genreLocked: Boolean(locks.genreLockedAt || profileResponse.value?.user?.genre),
    documentNumberLocked: Boolean(locks.documentNumberLockedAt || profileResponse.value?.user?.documentNumber),
    provinceLocked: Boolean(locks.provinceLockedAt || profileResponse.value?.user?.provinceId)
  }
})

const allRequiredProfileCompleted = computed(() => {
  return Boolean(profileForm.dateOfBirth && profileForm.genre && profileForm.documentNumber && profileForm.provinceId)
})

const saveProfile = async () => {
  try {
    const payload: Record<string, string | number> = {}

    if (!surveyLocks.value.dateOfBirthLocked && profileForm.dateOfBirth) {
      payload.dateOfBirth = profileForm.dateOfBirth
    }

    if (!surveyLocks.value.genreLocked && profileForm.genre) {
      payload.genre = profileForm.genre
    }

    if (!surveyLocks.value.documentNumberLocked && profileForm.documentNumber) {
      payload.documentNumber = profileForm.documentNumber
    }

    if (!surveyLocks.value.provinceLocked && profileForm.provinceId) {
      payload.provinceId = profileForm.provinceId
    }

    if (Object.keys(payload).length === 0) {
      toast.add({
        title: 'Sin cambios para guardar',
        description: 'Los campos ya fueron completados o todavía están vacíos.',
        color: 'neutral'
      })
      return
    }

    submitting.value = true
    await $authFetch('/api/backend/users/me/profile', {
      method: 'PATCH',
      body: payload
    })

    await refreshProfile()

    toast.add({
      title: 'Perfil actualizado',
      description: 'Los datos guardados quedaron bloqueados para futuras ediciones.',
      color: 'success'
    })
  } catch (error: any) {
    const serverMessage = error?.data?.message || error?.message || 'No se pudo actualizar tu perfil.'
    toast.add({
      title: 'Error al guardar',
      description: serverMessage,
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <NuxtLayout name="panel-mi-cuenta">
    <UPageHeader
      title="Mi Perfil"
      :description="`Gestiona tu información personal, ${user?.firstName}`"
    />
    <UPageBody>
      <UCard>
        <div
          v-if="user"
          class="space-y-4"
        >
          <div>
            <p class="text-sm text-gray-500">
              Nombre completo
            </p>
            <p class="font-semibold">
              {{ user.fullName }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500">
              Correo electrónico
            </p>
            <p class="font-semibold">
              {{ user.email }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500">
              Rol
            </p>
            <p class="font-semibold capitalize">
              {{ user.role }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard class="mt-4">
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold">
                Datos requeridos para encuestas
              </h2>
              <p class="text-sm text-muted">
                Completá estos datos una sola vez. Cada campo queda bloqueado luego de guardarse.
              </p>
            </div>
            <UBadge
              :color="allRequiredProfileCompleted ? 'success' : 'warning'"
              variant="subtle"
            >
              {{ allRequiredProfileCompleted ? 'Completo' : 'Pendiente' }}
            </UBadge>
          </div>

          <UFormField
            label="Fecha de nacimiento"
            name="dateOfBirth"
            :help="surveyLocks.dateOfBirthLocked ? 'Este campo está bloqueado.' : undefined"
          >
            <UInput
              v-model="profileForm.dateOfBirth"
              type="date"
              class="w-full"
              :disabled="surveyLocks.dateOfBirthLocked"
            />
          </UFormField>

          <UFormField
            label="Género"
            name="genre"
            :help="surveyLocks.genreLocked ? 'Este campo está bloqueado.' : undefined"
          >
            <USelect
              v-model="profileForm.genre"
              :items="GENRE_OPTIONS"
              class="w-full"
              placeholder="Seleccioná una opción"
              :disabled="surveyLocks.genreLocked"
            />
          </UFormField>

          <UFormField
            label="Número de documento"
            name="documentNumber"
            :help="surveyLocks.documentNumberLocked ? 'Este campo está bloqueado.' : undefined"
          >
            <UInput
              v-model="profileForm.documentNumber"
              class="w-full"
              placeholder="Solo números"
              inputmode="numeric"
              :disabled="surveyLocks.documentNumberLocked"
            />
          </UFormField>

          <UFormField
            label="Provincia"
            name="provinceId"
            :help="surveyLocks.provinceLocked ? 'Este campo está bloqueado.' : undefined"
          >
            <USelect
              v-model="profileForm.provinceId"
              :items="PROVINCE_OPTIONS"
              class="w-full"
              placeholder="Seleccioná una provincia"
              :disabled="surveyLocks.provinceLocked"
            />
          </UFormField>

          <div class="flex justify-end">
            <UButton
              color="primary"
              :loading="submitting"
              :disabled="submitting"
              @click="saveProfile"
            >
              Guardar datos
            </UButton>
          </div>
        </div>
      </UCard>
    </UPageBody>
  </NuxtLayout>
</template>

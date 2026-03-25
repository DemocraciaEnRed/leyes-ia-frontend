<script setup lang="ts">
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'

definePageMeta({
  middleware: 'auth'
})

const toast = useToast()
const { user, refreshSession } = useAuth()
const inputDate = useTemplateRef('inputDate')

const GENRE_OPTIONS = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Femenino', value: 'femenino' },
  { label: 'No binario', value: 'no_binario' },
  { label: 'Otro', value: 'otro' },
  { label: 'Prefiero no decirlo', value: 'prefiero_no_decir' }
]

const { data: provincesResponse } = await useFetch<{ provinces: Array<{ id: number, code: string, name: string }> }>('/api/backend/utils/provinces')

const PROVINCE_OPTIONS = computed(() => {
  return (provincesResponse.value?.provinces || []).map(province => ({
    label: province.name,
    value: province.id
  }))
})

const submitting = ref(false)

const { data: profileResponse, refresh: refreshProfile } = await useAuthFetch<{ user: {
  dateOfBirth?: string | null
  genre?: string | null
  provinceId?: number | null
  surveyProfileLocks?: {
    dateOfBirthLockedAt?: string | null
    genreLockedAt?: string | null
    provinceLockedAt?: string | null
  }
} }>('/api/backend/users/me/profile')

const dateOfBirthEditable = shallowRef<CalendarDate | null>(null)
const maxDateOfBirth = today(getLocalTimeZone())
// constructor for CalendarDate is
// constructor(year: number, month: number, day: number);

const profileForm = reactive({
  dateOfBirth: '',
  genre: '',
  provinceId: undefined as number | undefined
})

watch(profileResponse, (value) => {
  profileForm.dateOfBirth = value?.user?.dateOfBirth || ''
  profileForm.genre = value?.user?.genre || ''
  profileForm.provinceId = value?.user?.provinceId ?? undefined
  if (profileForm.dateOfBirth) {
    const parts = profileForm.dateOfBirth.split('-').map(Number)

    if (parts.length === 3 && parts.every(part => Number.isFinite(part))) {
      const [year, month, day] = parts as [number, number, number]
      dateOfBirthEditable.value = new CalendarDate(year, month, day)
    } else {
      dateOfBirthEditable.value = null
    }
  } else {
    dateOfBirthEditable.value = null
  }
}, { immediate: true })

watch(dateOfBirthEditable, (value) => {
  profileForm.dateOfBirth = value ? value.toString() : ''
})

const surveyLocks = computed(() => {
  const locks = profileResponse.value?.user?.surveyProfileLocks || {}
  return {
    dateOfBirthLocked: Boolean(locks.dateOfBirthLockedAt || profileResponse.value?.user?.dateOfBirth),
    genreLocked: Boolean(locks.genreLockedAt || profileResponse.value?.user?.genre),
    provinceLocked: Boolean(locks.provinceLockedAt || profileResponse.value?.user?.provinceId)
  }
})

const allRequiredProfileCompleted = computed(() => {
  return Boolean(profileForm.dateOfBirth && profileForm.genre && profileForm.provinceId)
})

const saveProfile = async () => {
  try {
    const payload: Record<string, string | number> = {}
    const normalizedDateOfBirth = dateOfBirthEditable.value?.toString() || profileForm.dateOfBirth

    if (!surveyLocks.value.dateOfBirthLocked && normalizedDateOfBirth) {
      payload.dateOfBirth = normalizedDateOfBirth
    }

    if (!surveyLocks.value.genreLocked && profileForm.genre) {
      payload.genre = profileForm.genre
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

    try {
      await $fetch('/api/auth/refresh-token', {
        method: 'POST'
      })
    } catch (error: unknown) {
      void error
    }

    await refreshProfile()
    await refreshSession()

    toast.add({
      title: 'Perfil actualizado',
      description: 'Los datos guardados quedaron bloqueados para futuras ediciones.',
      color: 'success'
    })
  } catch (error: unknown) {
    const normalizedError = error as { data?: { message?: string }, message?: string }
    const serverMessage = normalizedError?.data?.message || normalizedError?.message || 'No se pudo actualizar tu perfil.'
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
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div class="flex items-start gap-4">
            <UAvatar
                :src="user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}`"
                :alt="user.fullName || 'User'"
                size="xl"
              />
              <div>

                <p class="text-sm text-gray-500">
                  Nombre completo
                </p>
                <p class="font-semibold">
                  {{ user.fullName }}
                </p>
              </div>
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
          <div class="grid gap-4 md:grid-cols-2">
          <UFormField
            label="Fecha de nacimiento"
            name="dateOfBirth"
            :help="surveyLocks.dateOfBirthLocked ? 'Este campo está bloqueado.' : undefined"
          >
             <UInputDate ref="inputDate" v-model="dateOfBirthEditable" class="w-full" :disabled="surveyLocks.dateOfBirthLocked" :max-value="maxDateOfBirth">
              <template #trailing>
                <UPopover
                  v-if="!surveyLocks.dateOfBirthLocked"
                  :reference="inputDate?.inputsRef[3]?.$el"
                >
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    icon="lucide:calendar"
                    aria-label="Select a date"
                    class="px-0"
                  />

                  <template #content>
                    <UCalendar v-model="dateOfBirthEditable" class="p-2" />
                  </template>
                </UPopover>
              </template>
            </UInputDate>
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
          </div>

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

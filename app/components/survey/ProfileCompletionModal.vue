<script setup lang="ts">
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'

const props = withDefaults(defineProps<{
  initialData?: {
    dateOfBirth?: string | null
    genre?: string | null
    provinceId?: number | null
  }
  provinceOptions: Array<{ label: string, value: number }>
}>(), {
  initialData: () => ({})
})

const emit = defineEmits<{
  close: [payload: {
    dateOfBirth: string
    genre: string
    provinceId: number
  } | null]
}>()

const GENRE_OPTIONS = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Femenino', value: 'femenino' },
  { label: 'No binario', value: 'no_binario' },
  { label: 'Otro', value: 'otro' },
  { label: 'Prefiero no decirlo', value: 'prefiero_no_decir' }
]

const inputDate = useTemplateRef('inputDate')
const dateOfBirthEditable = shallowRef<CalendarDate | null>(null)
const maxDateOfBirth = today(getLocalTimeZone())

const form = reactive({
  dateOfBirth: props.initialData?.dateOfBirth || '',
  genre: props.initialData?.genre || '',
  provinceId: props.initialData?.provinceId || undefined as number | undefined
})

const formError = ref('')

const parseDateOfBirth = (value: string | null | undefined): CalendarDate | null => {
  if (!value)
    return null

  const parts = value.split('-').map(Number)
  if (parts.length !== 3 || !parts.every(part => Number.isFinite(part)))
    return null

  const [year, month, day] = parts as [number, number, number]
  return new CalendarDate(year, month, day)
}

watch(() => props.initialData, (value) => {
  form.dateOfBirth = value?.dateOfBirth || ''
  form.genre = value?.genre || ''
  form.provinceId = value?.provinceId ?? undefined
  dateOfBirthEditable.value = parseDateOfBirth(value?.dateOfBirth)
}, { deep: true })

watch(dateOfBirthEditable, (value) => {
  form.dateOfBirth = value ? value.toString() : ''
})

const canSubmit = computed(() => {
  return Boolean(form.dateOfBirth && form.genre && form.provinceId)
})

const handleSubmit = () => {
  formError.value = ''

  if (!canSubmit.value) {
    formError.value = 'Completa fecha de nacimiento, género y provincia para continuar.'
    return
  }

  emit('close', {
    dateOfBirth: form.dateOfBirth,
    genre: form.genre,
    provinceId: Number(form.provinceId)
  })
}

const handleCancel = () => {
  emit('close', null)
}
</script>

<template>
  <UModal
    :dismissible="false"
    title="Completar perfil para responder"
    description="Para continuar con la encuesta, completa los datos requeridos."
    :close="{ onClick: handleCancel }"
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="formError"
          color="warning"
          variant="soft"
          icon="lucide:triangle-alert"
          :description="formError"
        />

        <UFormField
          label="Fecha de nacimiento"
          name="dateOfBirth"
        >
          <UInputDate
            ref="inputDate"
            v-model="dateOfBirthEditable"
            class="w-full"
            :max-value="maxDateOfBirth"
          >
            <template #trailing>
              <UPopover :reference="inputDate?.inputsRef[3]?.$el">
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="i-lucide-calendar"
                  aria-label="Seleccionar fecha"
                  class="px-0"
                />

                <template #content>
                  <UCalendar
                    v-model="dateOfBirthEditable"
                    class="p-2"
                    :max-value="maxDateOfBirth"
                  />
                </template>
              </UPopover>
            </template>
          </UInputDate>
        </UFormField>

        <UFormField
          label="Género"
          name="genre"
        >
          <USelect
            v-model="form.genre"
            :items="GENRE_OPTIONS"
            class="w-full"
            placeholder="Seleccioná una opción"
          />
        </UFormField>

        <UFormField
          label="Provincia"
          name="provinceId"
        >
          <USelect
            v-model="form.provinceId"
            :items="provinceOptions"
            class="w-full"
            placeholder="Seleccioná una provincia"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="w-full flex justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          @click="handleCancel"
        >
          Cancelar
        </UButton>
        <UButton
          color="primary"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          Guardar y continuar
        </UButton>
      </div>
    </template>
  </UModal>
</template>

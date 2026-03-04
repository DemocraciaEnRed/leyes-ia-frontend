<script setup lang="ts">
const { loggedIn, user } = useAuth()

const isProfileComplete = computed(() => {
  const currentUser = user.value

  if (!currentUser) {
    return true
  }

  if (typeof currentUser.hasSurveyProfile === 'boolean') {
    return currentUser.hasSurveyProfile
  }

  return Boolean(
    currentUser.dateOfBirth
    && currentUser.genre
    && currentUser.documentNumber
    && currentUser.provinceId
  )
})

const showBanner = computed(() => {
  return Boolean(loggedIn.value && user.value && !isProfileComplete.value)
})
</script>

<template>
  <UBanner
    v-if="showBanner"
    id="profile-completion-banner"
    icon="i-lucide-triangle-alert"
    color="warning"
    title="Para completar encuestas, terminá de completar tu perfil en Mi Cuenta."
    to="/mi-cuenta/perfil"
  />
</template>

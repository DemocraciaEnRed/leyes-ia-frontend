export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()

  const syncUnovisThemeClass = () => {
    document.body.classList.toggle('theme-dark', colorMode.value === 'dark')
  }

  watch(() => colorMode.value, syncUnovisThemeClass, { immediate: true })
})
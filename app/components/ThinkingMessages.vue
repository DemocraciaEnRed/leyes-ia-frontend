<script setup>
import { ref, onUnmounted } from 'vue'

const messages = [
  'Ehhh... estoy pensando...',
  'Uuuuhh... déjame analizar eso un momento.',
  'Mmmm... procesando la información que me diste.',
  'Ehhh... un momento, estoy reflexionando sobre eso.',
  'Uuu... dejame pensar.. esta dificil...',
  'Mmm... evaluando los datos proporcionados.',
  'Ehhh.. Ya estoy con vos.. espera un toque...',
  'Mmhhh.. dejame que busque algo..',
  'Uff.. no me esperaba esto.. aguanta..',
  'Ehhh... trabajando en ello, dame un segundo más.',
  'Uff... casi listo, solo organizo mis ideas.',
  'Aaaah... ya casi tengo algo para ti.'
]

const typingSpeed = 40 // ms por caracter
const pauseAfterFull = 1400 // ms de pausa cuando el mensaje está completo

let messageIndex = 0
const typedMessage = ref('')

let typingTimer = null
let pauseTimer = null

function startTyping() {
  const full = messages[messageIndex]
  let charIndex = 0
  typedMessage.value = ''

  typingTimer = setInterval(() => {
    typedMessage.value += full[charIndex]
    charIndex++
    if (charIndex >= full.length) {
      clearInterval(typingTimer)
      typingTimer = null
      pauseTimer = setTimeout(() => {
        messageIndex = (messageIndex + 1) % messages.length
        startTyping()
      }, pauseAfterFull)
    }
  }, typingSpeed)
}

startTyping()

onUnmounted(() => {
  if (typingTimer) clearInterval(typingTimer)
  if (pauseTimer) clearTimeout(pauseTimer)
})
</script>

<template>
  <div class="text-sm">
    <transition
      name="fade-slide"
      mode="out-in"
    >
      <p :key="messageIndex">
        {{ typedMessage }}
      </p>
    </transition>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 280ms ease, transform 280ms ease;
}
.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
}
.fade-slide-enter-to {
    opacity: 1;
    transform: translateY(0) scale(1);
}
.fade-slide-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
}
</style>

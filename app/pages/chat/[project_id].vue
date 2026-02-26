<script setup>
import { useRoute } from 'vue-router'
import { getTextFromMessage } from '@nuxt/ui/runtime/utils/ai.js'
import { v4 as uuidv4 } from 'uuid'

definePageMeta({
})

const route = useRoute()
const projectId = route.params.project_id
const sessionId = ref(null)
const userId = ref(null)
const app_name = 'agente_analista'
const messages = ref([
  // {
  //     id: '6045235a-a435-46b8-989d-2df38ca2eb47',
  //     role: 'user',
  //     parts: [
  //         {
  //             type: 'text',
  //             text: 'Hello, how are you?'
  //         }
  //     ]
  // },
  // {
  //     id: '7a92b3c1-d5f8-4e76-b8a9-3c1e5fb2e0d8',
  //     role: 'assistant',
  //     parts: [
  //         {
  //             type: 'text',
  //             text: 'I am doing well, thank you for asking! How can I assist you today?'
  //         }
  //     ]
  // },
  // {
  //     id: '9c84d6a7-8b23-4f12-a1d5-e7f3b9c05e2a',
  //     role: 'user',
  //     parts: [
  //         {
  //             type: 'text',
  //             text: 'What is the current weather in Tokyo?'
  //         }
  //     ]
  // },
  // {
  //     id: 'b2e5f8c3-a1d9-4e67-b3f2-c9d8e7a6b5f4',
  //     role: 'assistant',
  //     parts: [
  //         {
  //             type: 'text',
  //             text: "Based on the latest data, **Tokyo** is currently experiencing _sunny_ weather with temperatures around `24°C (75°F)`. It's a beautiful day with [clear skies](https://www.weather.com/weather/today/l/Tokyo+Japan)."
  //         }
  //     ]
  // }
])

const input = ref('')
const statusPrompt = ref('ready') // "error" | "submitted" | "streaming" | "ready"
const assistant = {
  side: 'left',
  variant: 'outline',
  avatar: {
    icon: 'i-lucide-bot'
  },
  actions: [
    {
      label: 'Copy to clipboard',
      icon: 'i-lucide-copy'
    }
  ]
}

// POST to http://localhost:8000/run
const runEndpoint = '/genai/run'

const newSession = async () => {
  sessionId.value = uuidv4()
  console.log('New session started:', sessionId.value)
  userId.value = uuidv4()
  console.log('User ID set:', userId.value)
  const { data } = await useFetch(`/genai/apps/${app_name}/users/${userId.value}/sessions/${sessionId.value}`, {
    method: 'POST',
    body: {
      proyecto_elegido: projectId
    }
  })
  console.log('Session initialized on backend:', data)
}

const submitMessage = async () => {
  statusPrompt.value = 'submitted'
  const message = input.value.trim()
  // Clear input
  input.value = ''
  messages.value.push({
    id: crypto.randomUUID(),
    role: 'user',
    parts: [
      {
        type: 'text',
        text: message
      }
    ]
  })
  // Send message to backend
  const { data } = await useFetch(runEndpoint, {
    method: 'POST',
    body: {
      id: uuidv4(),
      appName: app_name,
      userId: userId.value,
      sessionId: sessionId.value,
      newMessage: {
        role: 'user',
        parts: [
          { text: message }
        ]
      }
    }
  })
  console.log(data.value) // an array of many messages

  data.value.pop().content.parts.forEach((part) => {
    console.log('Received part:', part)
    // Append part to messages
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: part.text
        }
      ]
    })
  })

  statusPrompt.value = 'ready'
  console.log('Submitted message:', message)
}

const stopGenerating = () => {
  messages.value.push({
    id: crypto.randomUUID(),
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: '[Generation stopped by user]'
      }
    ]
  })
  console.log('Stopped generating response')
}
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <UContainer>
        <h1 class="text-4xl font-bold mb-4 text-center">
          Hola, ¿cómo puedo ayudarte?
        </h1>
        <div class="flex justify-center mb-4">
          <UButton
            v-if="!sessionId"
            color="primary"
            label="Iniciar nueva sesión de chat"
            @click="newSession"
          />
        </div>

        <UChatMessages
          v-if="sessionId"
          :messages="messages"
          :status="statusPrompt"
          :assistant="assistant"
        >
          <template #indicator>
            <UButton
              class="px-0"
              color="neutral"
              variant="link"
              loading
              loading-icon="i-lucide-loader"
              label="Thinking..."
            />
          </template>
          <template #content="{ message }">
            <MDC
              :value="getTextFromMessage(message)"
              :cache-key="message.id"
              class="*:first:mt-0 *:last:mb-0"
            />
          </template>
        </UChatMessages>
      </UContainer>
    </template>
    <template
      v-if="sessionId"
      #footer
    >
      <UContainer class="pb-4 sm:pb-6">
        <UChatPrompt
          v-model="input"
          variant="subtle"
          @submit="submitMessage"
        >
          <UChatPromptSubmit
            :status="statusPrompt"
            @stop="stopGenerating"
            @reload="submitMessage"
          />
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>

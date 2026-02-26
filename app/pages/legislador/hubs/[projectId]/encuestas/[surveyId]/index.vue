<script setup>
import { getQuestionTypeLabel } from '~/utils/getQuestionTypeLabel'

const runtimeConfig = useRuntimeConfig()

definePageMeta({
  layout: 'workspace'
})
const route = useRoute()
const projectId = route.params.projectId
const surveyId = route.params.surveyId

const { data: dataResponse, pending, error, refresh } = await useFetch(`/api/backend/projects/${projectId}/manage/surveys/${surveyId}`)
</script>

<template>
  <NuxtLayout name="panel-proyecto">
    <UPageHeader
      title="Ver detalles"
      headline="Encuestas"
    />
    <UPageBody>
      <UProgress
        v-if="pending"
        animation="swing"
      />
      <UAlert
        v-if="error"
        title="Error al cargar la encuesta"
        :description="error.message || 'Ocurrió un error inesperado al intentar cargar la encuesta.'"
        color="danger"
        variant="subtle"
        icon="lucide:alert-circle"
      />
      <h1 class="text-2xl font-bold mb-4">
        {{ dataResponse?.survey.title }}
      </h1>
      <p class="text-muted mb-6">
        {{ dataResponse?.survey.about }}
      </p>
      <USeparator />
      <h2 class="text-xl font-semibold mt-6 mb-4">
        Configuración
      </h2>

      <table class="w-full mb-6 table-auto border-collapse border border-accented text-sm">
        <tr>
          <td class="border border-accented bg-accented/35 font-semibold p-2">
            ID de la encuesta:
          </td>
          <td class="border border-accented p-2">
            {{ dataResponse?.survey.id }}
          </td>
        </tr>
        <tr>
          <td class="border border-accented bg-accented/35 font-semibold p-2">
            Fecha de creación:
          </td>
          <td class="border border-accented p-2">
            {{ new Date(dataResponse?.survey.createdAt).toLocaleDateString() }} a las {{ new Date(dataResponse?.survey.createdAt).toLocaleTimeString() }}
          </td>
        </tr>
        <!-- closedAt -->
        <tr>
          <td class="border border-accented bg-accented/35 font-semibold p-2">
            Fecha de cierre:
          </td>
          <td
            v-if="dataResponse?.survey.closedAt"
            class="border border-accented p-2"
          >
            {{ new Date(dataResponse?.survey.closedAt).toLocaleDateString() }} a las {{ new Date(dataResponse?.survey.closedAt).toLocaleTimeString() }}
          </td>
          <td
            v-else
            class="border border-accented p-2"
          >
            No establecida
          </td>
        </tr>

        <tr>
          <td class="border border-accented bg-accented/35 font-semibold p-2">
            Número de preguntas:
          </td>
          <td class="border border-accented p-2">
            {{ dataResponse?.survey.questions.length }}
          </td>
        </tr>
        <tr>
          <td class="border border-accented bg-accented/35 font-semibold p-2">
            Número de respuestas:
          </td>
          <td class="border border-accented p-2">
            {{ dataResponse?.survey.responsesCount }}
          </td>
        </tr>
        <tr>
          <td class="border border-accented bg-accented/35 font-semibold p-2">
            Visible para encuestados:
          </td>
          <td class="border border-accented p-2">
            {{ dataResponse?.survey.visible ? 'Sí' : 'No' }}
          </td>
        </tr>
        <tr>
          <td class="border border-accented bg-accented/35 font-semibold p-2">
            Permitir respuestas anónimas:
          </td>
          <td class="border border-accented p-2">
            {{ dataResponse?.survey.allowAnonymousResponses ? 'Sí' : 'No' }}
          </td>
        </tr>
        <tr>
          <td class="border border-accented bg-accented/35 font-semibold p-2">
            Publica
          </td>
          <td class="border border-accented p-2">
            {{ dataResponse?.survey.public ? 'Sí' : 'No' }}
          </td>
        </tr>
        <tr>
          <td class="border border-accented bg-accented/35 font-semibold p-2">
            Tipo de encuesta:
          </td>
          <td class="border border-accented p-2">
            {{ getSurveyType(dataResponse?.survey.type) }}
          </td>
        </tr>
      </table>
      <USeparator />
      <h2 class="text-xl font-semibold mb-4">
        Instrucciones para generar la encuesta
      </h2>
      <!-- objective               -->
      <h3 class="font-semibold">
        Objetivo de la encuesta
      </h3>
      <div class="px-5 py-2 rounded-md bg-muted/50 ">
        <p>{{ dataResponse?.survey.objective }}</p>
      </div>
      <!-- targetAudience          -->
      <h3 class="font-semibold mb-2">
        Público objetivo de la encuesta
      </h3>
      <div class="px-5 py-2 rounded-md bg-muted/50 ">
        <p>{{ dataResponse?.survey.targetAudience }}</p>
      </div>
      <!-- context                 -->
      <h3 class="font-semibold mb-2">
        Contexto de la encuesta
      </h3>
      <div class="px-5 py-2 rounded-md bg-muted/50 ">
        <p>{{ dataResponse?.survey.context }}</p>
      </div>
      <!-- userInstructions               -->
      <h3 class="font-semibold mb-2">
        Instrucciones para generar las preguntas
      </h3>
      <div class="px-5 py-2 rounded-md bg-muted/50 ">
        <p>{{ dataResponse?.survey.userInstructions }}</p>
      </div>
      <USeparator />
      <h2 class="text-xl font-semibold mb-4">
        Mensaje de bienvenida
      </h2>

      <UPageCard
        variant="outline"
        class=""
      >
        <div class="flex flex-col items-center justify-center text-center space-y-2 min-h-75">
          <p class="text-4xl">
            👋
          </p>
          <h1 class="font-bold text-2xl">
            {{ dataResponse?.survey.welcomeTitle }}
          </h1>
          <p class="text-md text-muted">
            {{ dataResponse?.survey.welcomeDescription }}
          </p>
        </div>
      </UPageCard>
      <USeparator />
      <h2 class="text-xl font-semibold mt-6 mb-4">
        Preguntas de la encuesta
      </h2>
      <UPageCard
        v-for="(question, index) in dataResponse?.survey.questions"
        :key="index"
        variant="outline"
        class="bg-elevated<"
      >
        <div class="flex justify-between items-start gap-4">
          <div class="flex-1 space-y-3">
            <div class="flex items-start gap-3">
              <UBadge
                color="primary"
                variant="subtle"
              >
                {{ index + 1 }}
              </UBadge>
              <div class="flex-1">
                <h3 class="text-lg font-semibold">
                  {{ question.questionText }}
                </h3>
              </div>
            </div>
            <div
              v-if="question.helpText"
              class="text-sm text-gray-600 dark:text-gray-400"
            >
              <span class="font-medium" /> {{ question.helpText }}
            </div>

            <div class="flex gap-2 flex-wrap">
              <UBadge
                color="neutral"
                variant="subtle"
              >
                {{ getQuestionTypeLabel(question.type) }}
              </UBadge>
              <UBadge
                v-if="question.scale"
                color="neutral"
                variant="subtle"
              >
                Escala: 1-{{ question.scale }}
              </UBadge>
              <UBadge
                v-if="question.maxLength"
                color="neutral"
                variant="subtle"
              >
                Máx: {{ question.maxLength }} caracteres
              </UBadge>
              <UBadge
                v-if="question.required"
                color="error"
                variant="subtle"
              >
                Obligatoria
              </UBadge>
              <UBadge
                v-else
                color="neutral"
                variant="subtle"
              >
                Opcional
              </UBadge>
            </div>

            <div
              v-if="question.options && question.options.length > 0"
              class="space-y-1"
            >
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Opciones:
              </p>
              <ul class="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                >
                  {{ option }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </UPageCard>
    </UPageBody>
  </NuxtLayout>
</template>

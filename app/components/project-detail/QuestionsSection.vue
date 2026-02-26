<script setup lang="ts">
const props = defineProps<{
  questions: string[]
}>()
</script>

<template>
  <UPageSection
    title="Preguntas para empezar"
    description="Disparadores para conversar y participar con una mirada ciudadana."
  >
    <template #headline>
      <div class="text-5xl leading-none text-center">
        💬
      </div>
    </template>

    <UAlert
      v-if="props.questions.length === 0"
      icon="lucide:help-circle"
      color="neutral"
      variant="subtle"
      title="Aún no hay preguntas sugeridas"
      description="Pronto se publicarán preguntas para guiar la conversación."
    />

    <div
      v-else
      class="flex flex-wrap gap-2"
    >
      <UBadge
        v-for="(question, index) in props.questions"
        :key="`${question}-${index}`"
        size="lg"
        color="neutral"
        variant="subtle"
        class="whitespace-normal py-2 px-3"
      >
        {{ question }}
      </UBadge>
    </div>
  </UPageSection>
</template>

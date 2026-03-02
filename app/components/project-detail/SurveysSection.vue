<script setup lang="ts">
interface PublicSurvey {
  id: number
  projectId: number
  title: string
  about: string | null
  type: string
  welcomeTitle: string | null
  welcomeDescription: string | null
  responsesCount: number
  closedAt: string | null
  createdAt: string
  updatedAt: string
  isFeatured?: boolean
}

const props = defineProps<{
  featuredSurvey?: PublicSurvey | null
  surveys?: PublicSurvey[]
}>()

const availableSurveys = computed(() => props.surveys || [])
const hasData = computed(() => Boolean(props.featuredSurvey) || availableSurveys.value.length > 0)

const surveyDescription = (survey: PublicSurvey) => {
  return survey.about || survey.welcomeDescription || 'Encuesta abierta para participación ciudadana.'
}
</script>

<template>
  <UPageSection
    v-if="hasData"
    title="Encuestas activas"
    description="Participá en las encuestas disponibles sobre este proyecto."
  >
    <template #headline>
      <div class="text-5xl leading-none text-center">
        🗳️
      </div>
    </template>

    <UPageCard
      v-if="featuredSurvey"
      variant="soft"
      class="border border-warning/40"
    >
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            color="warning"
            variant="soft"
            icon="lucide:star"
          >
            Encuesta destacada
          </UBadge>
          <UBadge
            color="neutral"
            variant="outline"
          >
            {{ featuredSurvey.responsesCount }} respuestas
          </UBadge>
        </div>
        <h3 class="text-xl font-semibold">
          {{ featuredSurvey.title }}
        </h3>
        <p class="text-sm text-muted">
          {{ surveyDescription(featuredSurvey) }}
        </p>
      </div>
    </UPageCard>

    <UCarousel
      v-if="availableSurveys.length"
      v-slot="{ item }"
      arrows
      dots
      :items="availableSurveys"
      :ui="{ item: 'basis-full md:basis-1/2 lg:basis-1/3' }"
    >
      <UPageCard
        variant="outline"
        class="h-full"
      >
        <div class="flex h-full flex-col gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              color="neutral"
              variant="subtle"
            >
              {{ item.type }}
            </UBadge>
            <UBadge
              v-if="item.isFeatured"
              color="warning"
              variant="soft"
              icon="lucide:star"
            >
              Destacada
            </UBadge>
          </div>

          <h4 class="font-semibold leading-tight">
            {{ item.title }}
          </h4>

          <p class="text-sm text-muted line-clamp-4">
            {{ surveyDescription(item) }}
          </p>

          <div class="mt-auto pt-2">
            <UBadge
              color="neutral"
              variant="outline"
            >
              {{ item.responsesCount }} respuestas
            </UBadge>
          </div>
        </div>
      </UPageCard>
    </UCarousel>
  </UPageSection>
</template>

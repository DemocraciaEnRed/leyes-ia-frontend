<script setup lang="ts">
import type { DemographicDistributionItem, SurveyResultsResponse } from './types'
import type { ChartColorMode } from '~/utils/chartColors'
import { buildIndexedChartCategories, getChartColor } from '~/utils/chartColors'
import { LegendPosition } from '#imports';

interface Props {
  demographics?: SurveyResultsResponse['demographics'] | null
  defaultColorMode?: ChartColorMode
  provinceColorMode?: ChartColorMode
  singleColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  demographics: null,
  defaultColorMode: 'indexed',
  provinceColorMode: 'indexed',
  singleColor: 'var(--ui-primary)'
})

const genreDistribution = computed(() => props.demographics?.genre || [])
const ageRangesDistribution = computed(() => props.demographics?.ageRanges || [])
const provinceDistribution = computed(() => props.demographics?.provinces || [])

const demographicDonutCategories = (items: DemographicDistributionItem[], colorMode: ChartColorMode) => {
  return buildIndexedChartCategories(
    items,
    item => item.label,
    {
      keyPrefix: 'bucket_',
      colorMode,
      singleColor: props.singleColor
    }
  )
}

const demographicDonutData = (items: DemographicDistributionItem[]) => {
  return items.map(item => item.count)
}

const ageChartData = computed(() => {
  return ageRangesDistribution.value.map(item => ({
    range: item.label,
    count: item.count
  }))
})

const ageChartCategories = computed(() => ({
  count: {
    name: 'Personas',
    color: getChartColor(0, props.defaultColorMode, props.singleColor)
  }
}))
</script>

<template>
  <div
  class="space-y-4"
  >
    <div class="flex items-center text-lg font-semibold md:text-2xl font-title">
      <UIcon name="lucide:users" class="inline-block mr-2" />
      <span>Estadística demográfica</span>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <UPageCard
        variant="subtle"
        :ui="{ container: 'space-y-3' }"
      >
        <h3 class="font-medium">
          Distribución por género
        </h3>

        <p class="text-xs text-muted">
          Respondentes con dato de género: {{ demographics?.totalWithGenre || 0 }}
        </p>

        <div
          v-if="genreDistribution.length > 0"
          class="space-y-3"
        >
          <DonutChart
            :data="demographicDonutData(genreDistribution)"
            :categories="demographicDonutCategories(genreDistribution, defaultColorMode)"
            :radius="120"
            :pad-angle="0.075"
            :height="180"
          />

          <ul class="space-y-1 text-sm">
            <li
              v-for="item in genreDistribution"
              :key="item.key"
              class="flex items-center justify-between"
            >
              <span class="text-highlighted">{{ item.label }}</span>
              <span class="text-muted">{{ item.count }} ({{ item.percentage }}%)</span>
            </li>
          </ul>
        </div>

        <p
          v-else
          class="text-sm text-muted"
        >
          No hay datos suficientes para mostrar género.
        </p>
      </UPageCard>

      <UPageCard
        variant="subtle"
        :ui="{ container: 'space-y-3' }"
      >
        <h3 class="font-medium">
          Distribución por edades
        </h3>

        <p class="text-xs text-muted">
          Respondentes con fecha de nacimiento: {{ demographics?.totalWithAge || 0 }}
        </p>

        <div
          v-if="ageRangesDistribution.length > 0"
          class="space-y-3"
        >
          <BarChart
            :data="ageChartData"
            :categories="ageChartCategories"
            :yAxis="['count']"
            xAxis="range"
            :height="180"
            hideLegend
            :radius="4"
          />

          <ul class="space-y-1 text-sm">
            <li
              v-for="item in ageRangesDistribution"
              :key="item.key"
              class="flex items-center justify-between"
            >
              <span class="text-highlighted">{{ item.label }}</span>
              <span class="text-muted">{{ item.count }} ({{ item.percentage }}%)</span>
            </li>
          </ul>
        </div>

        <p
          v-else
          class="text-sm text-muted"
        >
          No hay datos suficientes para mostrar edades.
        </p>
      </UPageCard>
    </div>

    <UPageCard
      variant="subtle"
      :ui="{ container: 'space-y-3' }"
    >
      <h3 class="font-medium">
        Distribución por provincia
      </h3>

      <p class="text-xs text-muted">
        Respondentes con provincia informada: {{ demographics?.totalWithProvince || 0 }}
      </p>

      <div
        v-if="provinceDistribution.length > 0"
        class="grid gap-4 lg:grid-cols-2"
      >
        <DonutChart
          :data="demographicDonutData(provinceDistribution)"
          :categories="demographicDonutCategories(provinceDistribution, provinceColorMode)"
          :radius="120"
          :pad-angle="0.075"
          :height="180"
        />

        <div class="overflow-x-auto rounded-lg border border-default">
          <table class="w-full text-sm">
            <thead class="bg-elevated/40 text-xs text-muted">
              <tr>
                <th class="px-3 py-2 text-left font-medium">
                  Provincia
                </th>
                <th class="px-3 py-2 text-right font-medium">
                  Respuestas
                </th>
                <th class="px-3 py-2 text-right font-medium">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in provinceDistribution"
                :key="item.key"
                class="border-t border-default"
              >
                <td class="px-3 py-2 text-highlighted">
                  {{ item.label }}
                </td>
                <td class="px-3 py-2 text-right text-muted">
                  {{ item.count }}
                </td>
                <td class="px-3 py-2 text-right text-muted">
                  {{ item.percentage }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p
        v-else
        class="text-sm text-muted"
      >
        No hay datos suficientes para mostrar provincias.
      </p>
    </UPageCard>
</div>
</template>
<script setup>

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(value);
};

const baseStats = [{
  title: 'Comentarios',
  icon: 'lucide:message-circle',
  minValue: 400,
  maxValue: 1000,
  minVariation: -15,
  maxVariation: 25
}, {
  title: 'Respuestas a encuestas',
  icon: 'lucide:check-square',
  minValue: 1000,
  maxValue: 2000,
  minVariation: -10,
  maxVariation: 20
},{
  title: 'Chats iniciados',
  icon: 'lucide:bot-message-square',
  minValue: 1000,
  maxValue: 2000,
  minVariation: -10,
  maxVariation: 20
}, {
  title: 'Costos de IA',
  icon: 'lucide:message-square',
  minValue: 2000,
  maxValue: 120000,
  minVariation: -20,
  maxVariation: 30,
  formatter: formatCurrency
}, {
  title: 'Tokens procesados',
  icon: 'lucide:braces',
  minValue: 100000,
  maxValue: 1000000,
  minVariation: -5,
  maxVariation: 60
}]

const stats = baseStats.map(stat => {
  const value = Math.floor(Math.random() * (stat.maxValue - stat.minValue + 1)) + stat.minValue
  const variation = Math.floor(Math.random() * (stat.maxVariation - stat.minVariation + 1)) + stat.minVariation

  return {
    title: stat.title,
    icon: stat.icon,
    value: stat.formatter ? stat.formatter(value) : value,
    variation
  } 
})
</script>
    
<template>
  <UPageGrid class="lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      to="/workspaces"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ stat.value }}
        </span>

        <UBadge
          :color="stat.variation > 0 ? 'success' : 'error'"
          variant="subtle"
          class="text-xs"
        >
          {{ stat.variation > 0 ? '+' : '' }}{{ stat.variation }}%
        </UBadge>
      </div>
    </UPageCard>
  </UPageGrid>
</template>
<template>
  <div>
    <USeparator icon="lucide:heart" />
    <UFooter
      :ui="{
        root: 'py-9'
      }"
    >
    <div class="flex flex-col items-center gap-8 text-muted-foreground">
        <p class="text-sm">Un proyecto de...</p>
        <div class="flex items-center gap-5">
          <a href="https://democraciaenred.org">
            <!-- DER Logo for light mode -->
            <img
              src="/der-logo-dark.png"
              alt="Democracia en Red"
              class="h-9 dark:hidden"
            />
            <!-- DER Logo for dark mode -->
            <img
              src="/der-logo-light.png"
              alt="Democracia en Red"
              class="hidden h-9 dark:block"
            />
          </a>
          <UIcon name="lucide:plus" class="mx-2" :size="24" />
          <a href="https://phi.com">
            <!-- PHI Logo for light mode -->
            <img
              src="/phi-logo-dark.png"
              alt="PHI"
              class="h-9 dark:hidden"
            />
            <!-- PHI Logo for dark mode -->
            <img
              src="/phi-logo-light.png"
              alt="PHI"
              class="hidden h-9 dark:block"
            />
          </a>
        </div>
        <div class="flex flex-col items-center gap-1 text-sm">
          <!-- Acerca de -->
          <p>
            <NuxtLink to="/about" class="underline hover:text-primary">
              Acerca de
            </NuxtLink>
          </p>
          <!-- Politica de privacidad -->
          <p>
            <NuxtLink to="/privacy-policy" class="underline hover:text-primary">
              Política de Privacidad
            </NuxtLink>
          </p>
        </div>
      </div>
    </UFooter>
  </div>
</template>

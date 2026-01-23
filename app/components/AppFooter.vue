<template>
    <div>
        <USeparator icon="i-simple-icons-nuxtdotjs" />
        <UFooter>
            <template #left>
                <p class="text-sm text-muted">
                    Eng. Guillermo Croppi • Santex + Koi + Democracia en Red {{ new Date().getFullYear() }}
                </p>
            </template>

            <template #right>
                <UButton to="https://github.com/guillecro" target="_blank" icon="i-simple-icons-github"
                    aria-label="GitHub" color="neutral" variant="ghost" />
            </template>
        </UFooter>
    </div>
</template>
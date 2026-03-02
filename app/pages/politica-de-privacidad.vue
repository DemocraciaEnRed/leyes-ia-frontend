<script setup>

</script>

<template>
  <NuxtLayout name="default">
    <UContainer>
      <UPage>
        <UPageHeader
          title="Política de Privacidad"
          description="Información sobre cómo manejamos y protegemos tus datos personales."
        />
        <UPageBody>
          <UPageCard variant="subtle">
            <div class="space-y-6">
                <!-- Disclaimer at the top -->
                <UAlert
                    icon="i-heroicons-information-circle"
                    color="neutral"
                    variant="outline"
                    class="mb-6"
                    title="Última actualización"
                    description="Esta política fue modificada por última vez el 15 de enero de 2024."
                />
                <section>
                    <h2 class="text-2xl font-bold mb-3">1. Introducción</h2>
                    <p class="text-muted">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold mb-3">2. Información que Recopilamos</h2>
                    <p class="text-muted">
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold mb-3">3. Cómo Usamos tu Información</h2>
                    <p class="text-muted">
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
                    </p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold mb-3">4. Protección de Datos</h2>
                    <p class="text-muted">
                        Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
                    </p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold mb-3">5. Tus Derechos</h2>
                    <p class="text-muted">
                        Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.
                    </p>
                </section>

                <section>
                    <h2 class="text-2xl font-bold mb-3">6. Contacto</h2>
                    <p class="text-muted">
                        Si tienes preguntas sobre nuestra política de privacidad, por favor contáctanos a través de los canales disponibles en nuestro sitio web.
                    </p>
                </section>
            </div>
          </UPageCard>
        </UPageBody>
      </UPage>
    </UContainer>
  </NuxtLayout>
</template>

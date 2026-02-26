<script setup>
const items = ref([
  {
    icon: 'i-lucide-circle-help',
    label: '¿Qué es este proyecto?',
    content: 'Es una plataforma digital de participación ciudadana para legisladores y equipos técnicos, basada en inteligencia artificial. Su objetivo es promover el debate informado y la construcción de consensos en torno a proyectos de ley, fortaleciendo la deliberación democrática y mejorando la calidad de la legislación.'
  },
  {
    icon: 'i-lucide-circle-help',
    label: '¿Cómo funciona la IA?',
    content: `La plataforma utiliza distintos modelos de inteligencia artificial que cumplen funciones específicas, como resumir aportes, agrupar opiniones similares e identificar temas recurrentes, acuerdos y disensos. Esto permite procesar grandes volúmenes de información y generar evidencias útiles para el trabajo legislativo.

El código de integración desarrollado por Democracia en Red es de código abierto y está disponible en nuestro GitHub:
https://github.com/DemocraciaEnRed`
  },
  {
    icon: 'i-lucide-circle-help',
    label: '¿El proyecto es de código abierto?',
    content: `Sí. Todo el desarrollo propio realizado por Democracia en Red es de código abierto.

Para que la plataforma funcione, se utilizan servicios de terceros (modelos de IA) que tienen sus propias licencias y condiciones. Publicamos todo lo que está legal y técnicamente a nuestro alcance.`
  },
  {
    icon: 'i-lucide-circle-help',
    label: '¿La IA decide algo?',
    content: 'No. La IA no toma decisiones, no opina ni vota. Su rol es organizar la información para que sea más fácil de analizar. Las decisiones legislativas siguen siendo responsabilidad exclusiva de los representantes.'
  },
  {
    icon: 'i-lucide-circle-help',
    label: '¿Qué pasa con mis datos?',
    content: 'Los datos y aportes se almacenan en servidores de Democracia en Red, alojados en DigitalOcean. Los aportes ciudadanos se procesan de forma anonimizada y se utilizan únicamente para generar los análisis, resúmenes y visualizaciones que muestra la plataforma.'
  },
  {
    icon: 'i-lucide-circle-help',
    label: '¿Tiene sesgos la plataforma?',
    content: 'Como toda herramienta tecnológica, puede tener sesgos. Por eso, estamos monitoreando de manera continua cómo la IA procesa la información y ajustando el sistema para reducir desvíos y asegurar que todas las posturas sean consideradas.'
  },
  {
    icon: 'i-lucide-circle-help',
    label: '¿Hay intervención humana en el proceso?',
    content: 'Sí. En algunos momentos clave, como antes de publicar un resumen, una encuesta o resultados visibles, el legislador o su equipo revisa y valida el contenido. La plataforma no publica automáticamente sin esa verificación.'
  },
  {
    icon: 'i-lucide-circle-help',
    label: '¿Quién está detrás del proyecto?',
    content: 'El proyecto es desarrollado por Democracia en Red y cuenta con el impulso y apoyo de Santex y Kol Ventures. Es una iniciativa conjunta que combina experiencia en democracia digital, desarrollo tecnológico e innovación.'
  },
  {
    icon: 'i-lucide-circle-help',
    label: '¿Quiénes pueden subir proyectos?',
    content: `En esta etapa, los proyectos pueden ser cargados únicamente por legisladores y sus equipos técnicos.

Si sos legislador o asesor y te interesa participar, podés escribirnos a:
✉️ contacto@democraciaenred.org`
  },
  {
    icon: 'i-lucide-circle-help',
    label: '¿Puedo usar la plataforma en mi país?',
    content: `Por ahora, la plataforma está desarrollada para Argentina. A futuro, buscamos adaptarla a otros países.

Si te interesa explorar una alianza concreta o creés que hay potencial real de implementación en tu contexto, escribinos a:
✉️ contacto@democraciaenred.org`
  },
  {
    icon: 'i-lucide-circle-help',
    label: '¿Hay que registrarse para usar la plataforma?',
    content: 'Depende de la actividad. Algunas formas de participación no requieren registro, mientras que otras sí, para garantizar trazabilidad y calidad de los aportes.'
  },
  {
    icon: 'i-lucide-circle-help',
    label: '¿Esto reemplaza la participación ciudadana o la política?',
    content: `No. La plataforma no reemplaza la participación ciudadana ni los procesos políticos.

La inteligencia artificial no decide ni sustituye el debate democrático: solo ayuda a hacer más accesible la información y a organizar los aportes para fortalecer la deliberación pública.`
  }
])
</script>

<template>

<UAccordion
    :items="items"
    :ui="{ label: 'font-bold text-lg text-start break-words cursor-pointer', trailingIcon: 'cursor-pointer' }"
    type="multiple"
            />
</template>

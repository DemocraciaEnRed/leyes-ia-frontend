const labels = {
  'multiple-choice': 'Opción múltiple',
  'single-choice': 'Opción simple',
  'open-ended': 'Respuesta abierta',
  'rating': 'Calificación'
} as const

type QuestionType = keyof typeof labels

export const getQuestionTypeLabel = (type?: string): string => {
  if (!type) {
    return ''
  }

  if (type in labels) {
    return labels[type as QuestionType]
  }

  return type
}

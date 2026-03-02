export const QUESTION_TYPE_LABELS = {
  'multiple-choice': 'Opción múltiple',
  'single-choice': 'Opción simple',
  'open-ended': 'Respuesta abierta',
  'rating': 'Calificación'
} as const

export type QuestionType = keyof typeof QUESTION_TYPE_LABELS

export const QUESTION_TYPE_OPTIONS = [
  { label: QUESTION_TYPE_LABELS['single-choice'], value: 'single-choice' },
  { label: QUESTION_TYPE_LABELS['multiple-choice'], value: 'multiple-choice' },
  { label: QUESTION_TYPE_LABELS['open-ended'], value: 'open-ended' },
  { label: QUESTION_TYPE_LABELS.rating, value: 'rating' }
] as const

export const getQuestionTypeLabel = (type?: string): string => {
  if (!type) {
    return ''
  }

  if (type in QUESTION_TYPE_LABELS) {
    return QUESTION_TYPE_LABELS[type as QuestionType]
  }

  return type
}

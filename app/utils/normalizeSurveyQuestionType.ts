const QUESTION_TYPE_ALIASES = {
  'single-choice': ['single-choice', 'single_choice', 'singlechoice'],
  'multiple-choice': ['multiple-choice', 'multiple_choice', 'multiplechoice'],
  rating: ['rating', 'scale', 'calificacion', 'calificación'],
  'open-ended': ['open-ended', 'open_ended', 'openended', 'texto', 'text', 'open']
} as const

export type NormalizedSurveyQuestionType = keyof typeof QUESTION_TYPE_ALIASES

export const normalizeSurveyQuestionType = (rawType?: string): NormalizedSurveyQuestionType => {
  const normalizedRawType = String(rawType || '').toLowerCase().trim()

  for (const [normalizedType, aliases] of Object.entries(QUESTION_TYPE_ALIASES) as Array<
    [NormalizedSurveyQuestionType, readonly string[]]
  >) {
    if (aliases.includes(normalizedRawType)) {
      return normalizedType
    }
  }

  return 'open-ended'
}

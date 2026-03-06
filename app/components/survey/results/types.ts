export type QuestionType = 'single-choice' | 'multiple-choice' | 'rating' | 'open-ended'

export interface DistributionOption {
  option: string
  count: number
  percentage: number
}

export interface DistributionRating {
  value: number
  count: number
  percentage: number
}

export interface BaseQuestionResult {
  questionIndex: number
  title: string
  type: QuestionType
  required: boolean
  totalResponses: number
  totalAnswers: number
  skippedCount: number
}

export interface SurveyQuestionDefinition {
  title?: string
  questionText?: string
  helpText?: string | null
}

export interface ChoiceQuestionResult extends BaseQuestionResult {
  type: 'single-choice' | 'multiple-choice'
  distribution: DistributionOption[]
}

export interface RatingQuestionResult extends BaseQuestionResult {
  type: 'rating'
  scale: number
  average: number | null
  distribution: DistributionRating[]
}

export interface OpenEndedQuestionResult extends BaseQuestionResult {
  type: 'open-ended'
  responses: string[]
}

export type SurveyQuestionResult = ChoiceQuestionResult | RatingQuestionResult | OpenEndedQuestionResult

export interface DemographicDistributionItem {
  key: string
  label: string
  count: number
  percentage: number
}

export interface SurveyResultsResponse {
  survey: {
    id: number
    title: string
    about?: string | null
    responsesCount?: number
    closedAt?: string | null
    questions?: SurveyQuestionDefinition[]
  }
  summary: {
    totalResponses: number
    totalQuestions: number
  }
  questions: SurveyQuestionResult[]
  demographics: {
    totalWithGenre: number
    totalWithAge: number
    totalWithProvince: number
    genre: DemographicDistributionItem[]
    ageRanges: DemographicDistributionItem[]
    provinces: DemographicDistributionItem[]
  }
}
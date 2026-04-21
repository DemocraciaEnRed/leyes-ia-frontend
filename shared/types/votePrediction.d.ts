import type { PoliticalParty } from './politicalParty'

export type VoteValue = 'yes' | 'no' | 'abstain' | 'divided'
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface VotePredictionSource {
  title: string
  url?: string | null
  date?: string | null
}

export interface VotePrediction {
  id: number
  projectId: number
  politicalPartyId: number
  theoreticalVote: VoteValue | null
  theoreticalJustification: string | null
  theoreticalSources: VotePredictionSource[] | null
  theoreticalConfidence: ConfidenceLevel | null
  contextualVote: VoteValue | null
  contextualJustification: string | null
  contextualSources: VotePredictionSource[] | null
  contextualConfidence: ConfidenceLevel | null
  contextualDateFrom: string | null
  contextualDateTo: string | null
  contextualDiffersFromTheoretical: boolean | null
  contextualReasonForDifference: string | null
  generatedAt: string | null
  generatedByUserId: number | null
  status: 'pending' | 'generated' | 'failed'
  politicalParty?: PoliticalParty
  createdAt: string
  updatedAt: string
}

export interface VotePredictionListResponse {
  predictions: VotePrediction[]
}

export interface VotePredictionPublicResponse {
  predictions: VotePrediction[]
  disclaimer: string | null
}

export interface VoteResult {
  id: number
  projectId: number
  voteDate: string | null
  totalYes: number
  totalNo: number
  totalAbstain: number
  sourceUrl: string | null
  rawActaData: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  resultsByParty?: VoteResultByParty[]
}

export interface VoteResultByParty {
  id: number
  projectVoteResultId: number
  politicalPartyId: number
  votedYes: number
  votedNo: number
  votedAbstain: number
  majorityVote: 'yes' | 'no' | 'abstain' | 'divided'
  politicalParty?: Pick<PoliticalParty, 'id' | 'name' | 'shortName' | 'slug' | 'logoUrl'>
}

export interface VoteResultResponse {
  voteResult: VoteResult
}

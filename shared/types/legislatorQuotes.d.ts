import type { Legislator } from './legislator'

export interface LegislatorQuote {
  date: string | null
  source: string
  sourceUrl: string | null
  content: string
  context: string
}

export interface LegislatorQuoteResult {
  legislatorId: number
  legislatorName: string
  found: boolean
  summary: string
  stance: 'a_favor' | 'en_contra' | 'neutral' | 'ambiguo' | null
  quotes: LegislatorQuote[]
  cached: boolean
  searchId: string | null
}

export interface LegislatorQuoteSearchRequest {
  legislatorIds: number[]
  dateRangeStart?: string | null
  dateRangeEnd?: string | null
  forceRegenerate?: boolean
}

export interface LegislatorQuoteSearchResponse {
  results: LegislatorQuoteResult[]
  usage: {
    model: string
    totalTokens: number
    latencyMs: number
  } | null
}

export interface LegislatorQuoteSearchRecord {
  id: string
  legislatorId: number
  dateRangeStart: string | null
  dateRangeEnd: string | null
  result: {
    legislatorId: number
    legislatorName: string
    found: boolean
    summary: string
    stance: 'a_favor' | 'en_contra' | 'neutral' | 'ambiguo' | null
    quotes: LegislatorQuote[]
  }
  stance: string | null
  found: boolean
  createdAt: string
  legislator: Pick<Legislator, 'id' | 'firstName' | 'lastName' | 'chamber' | 'blockName' | 'photoUrl'> & {
    province: { id: number; name: string } | null
  }
}

export interface LegislatorQuoteHistoryResponse {
  results: LegislatorQuoteSearchRecord[]
}

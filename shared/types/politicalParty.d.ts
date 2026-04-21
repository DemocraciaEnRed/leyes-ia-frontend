export interface PoliticalParty {
  id: number
  name: string
  slug: string
  shortName: string | null
  logoUrl: string | null
  status: 'draft' | 'active' | 'archived'
  profileSummary: string | null
  profileExpandedWithSearch: boolean
  profileGeneratedAt: string | null
  createdAt: string
  updatedAt: string
  filesCount?: number
  files?: PoliticalPartyFile[]
  partyLegislators?: PoliticalPartyLegislator[]
}

export interface PoliticalPartyFile {
  id: number
  politicalPartyId: number
  type: 'platform' | 'speech' | 'document' | 'other'
  name: string
  size: number
  mimeType: string
  s3Key?: string
  createdAt: string
}

export interface PoliticalPartyLegislator {
  id: number
  politicalPartyId: number
  fullName: string
  chamber: 'deputies' | 'senators' | null
  provinceId: number | null
  photoUrl: string | null
  status: 'active' | 'inactive'
  province?: { id: number; name: string }
}

export interface PoliticalPartyListResponse {
  parties: PoliticalParty[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

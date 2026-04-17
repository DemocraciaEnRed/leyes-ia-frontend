export interface Province {
  id: number
  name: string
  code: string
}

export interface Legislator {
  id: number
  externalId: string | null
  externalSource: 'hcdn' | 'senado' | 'other' | null
  firstName: string
  lastName: string
  fullName: string
  chamber: 'deputies' | 'senators'
  provinceId: number | null
  province: Province | null
  politicalPartyId: number | null
  blockName: string | null
  termStart: string | null
  termEnd: string | null
  photoUrl: string | null
  email: string | null
  active: boolean
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface LegislatorListResponse {
  legislators: Legislator[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface LegislatorDetailResponse {
  legislator: Legislator
}

export interface LegislatorFormData {
  firstName: string
  lastName: string
  chamber: 'deputies' | 'senators' | ''
  provinceId: number | null
  externalId: string
  externalSource: 'hcdn' | 'senado' | 'other' | ''
  blockName: string
  termStart: string
  termEnd: string
  photoUrl: string
  email: string
  active: boolean
  metadata: string
}

declare module '#auth-utils' {
  interface User {
    id: number
    firstName: string
    lastName: string
    fullName: string
    role: 'user' | 'admin' | 'legislator'
    imageUrl: string | null
    email?: string // Optional - not returned by API but may be decoded from JWT
    dateOfBirth?: string | null
    genre?: 'masculino' | 'femenino' | 'no_binario' | 'otro' | 'prefiero_no_decir' | null
    provinceId?: number | null
    hasSurveyProfile?: boolean
    surveyProfileLocks?: {
      dateOfBirthLockedAt?: string | null
      genreLockedAt?: string | null
      provinceLockedAt?: string | null
    }
  }

  interface SecureSessionData {
    // Add your own fields
    token: string
  }
  interface UserSession {
    /**
         * Session ID
         */
    id: string
    /**
         * User session data, available on client and server
         */
    user?: User
    /**
         * Private session data, only available on server/ code
         */
    secure?: SecureSessionData
    /**
         * Extra session data, available on client and server
         */
    [key: string]: unknown
  }
}

export { }

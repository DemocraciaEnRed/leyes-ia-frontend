export interface AuthSession {
  user: User
  secure: {
    token: string
  }
  loggedInAt: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
  magicWord: string
  dateOfBirth: string
  genre: 'masculino' | 'femenino' | 'no_binario' | 'otro' | 'prefiero_no_decir'
  documentNumber: string
  provinceId: number
}

export interface AuthResponse {
  token: string
  user: User
}

export interface AuthSession {
    user: User,
    secure: {
        token: string
    },
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
}

export interface AuthResponse {
  token: string
  user: User
}

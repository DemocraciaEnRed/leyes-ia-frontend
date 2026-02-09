declare module '#auth-utils' {
    interface User {
        id: number
        firstName: string
        lastName: string
        fullName: string
        role: 'user' | 'admin' | 'legislator'
        imageUrl: string | null
        email?: string // Optional - not returned by API but may be decoded from JWT
    }

    interface SecureSessionData {
        // Add your own fields
        token: string
    }
    interface UserSession {
        /**
         * Session ID
         */
        id: string;
        /**
         * User session data, available on client and server
         */
        user?: User;
        /**
         * Private session data, only available on server/ code
         */
        secure?: SecureSessionData;
        /**
         * Extra session data, available on client and server
         */
        [key: string]: unknown;
    }
}

export { }

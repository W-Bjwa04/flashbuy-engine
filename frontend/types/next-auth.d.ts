import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface User extends DefaultUser {
        id: string;
        // accessToken is returned by the backend and stored in the encrypted JWT.
        // It is intentionally NOT placed on the Session to prevent XSS exposure.
        accessToken: string;
    }

    interface Session {
        // accessToken is kept in the server-only JWT; it is NOT exposed here.
        user: {
            id: string;
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        id: string;
        accessToken: string;
        /** Unix timestamp (seconds) when the Express access token expires */
        accessTokenExpiry: number;
    }
}
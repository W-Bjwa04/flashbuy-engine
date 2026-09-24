import type { NextAuthConfig } from "next-auth";

// Backend ACCESS_TOKEN_EXPIRES_IN=60m — keep Auth.js session lifetime in sync
const BACKEND_TOKEN_LIFETIME_SECONDS = 60 * 60; // 1 hour

export const authConfig = {
    providers: [], // Intentionally empty; populated in auth.ts
    session: {
        strategy: "jwt",
        // Match the Auth.js session lifetime to the Express access token lifetime
        // so the session never outlives the backend token
        maxAge: BACKEND_TOKEN_LIFETIME_SECONDS,
    },
    callbacks: {
        // 1. Seal the Express JWT into the encrypted JWE cookie
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // Store the Express bearer token in the encrypted JWE cookie only
                token.accessToken = user.accessToken;
                // Record when this token expires so consumers can detect staleness
                token.accessTokenExpiry = Math.floor(Date.now() / 1000) + BACKEND_TOKEN_LIFETIME_SECONDS;
            }
            return token;
        },
        // 2. Expose only non-sensitive fields to the client session.
        // The Express bearer token stays in the encrypted JWT and is read
        // server-side via getServerToken() in lib/api.ts.
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                // NOTE: accessToken is intentionally NOT set here to prevent
                // client-side exposure via XSS. Use getServerToken() instead.
            }
            return session;
        },
    },
    pages: {
        signIn: "/login"
    },
    logger: {
        error(error: any) {
            const errorType = error.type || error.name || "UnknownError";
            const errorMessage = error.message || "";

            console.error(
                `\x1b[31m[Auth.js Error]\x1b[0m Type: \x1b[1m${errorType}\x1b[0m`
            );
            if (errorMessage) {
                console.error(`  ↳ Message: \x1b[33m${errorMessage}\x1b[0m\n`);
            }
        },
        warn(code) {
            console.warn(`\x1b[33m[Auth.js Warning]\x1b[0m ${code}`);
        },
        debug() { },
    }
} satisfies NextAuthConfig;

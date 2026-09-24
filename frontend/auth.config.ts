import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    providers: [], // Intentionally empty; populated in auth.ts
    session: {
        strategy: "jwt"
    },
    callbacks: {
        // 1. Seal the Express JWT into the encrypted JWE cookie
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.accessToken = user.accessToken;
            }
            return token;
        },
        // 2. Expose the Express JWT to the Next.js session
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.accessToken = token.accessToken;
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

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                // Bounded 10-second timeout: if the backend stalls, fail fast
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10_000);

                let res: Response;
                try {
                    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                        signal: controller.signal,
                    });
                } catch (fetchError: any) {
                    if (fetchError?.name === "AbortError") {
                        throw new Error("Authentication service timed out. Please try again.");
                    }
                    throw fetchError;
                } finally {
                    clearTimeout(timeoutId);
                }

                try {
                    const data = await res.json();

                    if (!res.ok) {
                        // 400/404 = bad credentials; anything else = backend failure
                        if (res.status === 400 || res.status === 404) {
                            return null;
                        }
                        throw new Error("Authentication service unavailable");
                    }

                    if (!data.success) {
                        return null;
                    }

                    // Return user object with the Express JWT attached
                    return {
                        id: String(data.data.user.id),
                        email: data.data.user.email,
                        accessToken: data.data.accessToken,
                    };
                } catch (error) {
                    console.error("[Auth.js Authorize Error]: ", error);
                    throw error;
                }
            }
        })
    ],
});

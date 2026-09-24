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

                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password
                        })
                    });

                    const data = await res.json();

                    if (!res.ok || !data.success) {
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
                    return null;
                }
            }
        })
    ],
});

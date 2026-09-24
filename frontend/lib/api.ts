import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";

interface FetchOptions extends RequestInit {
    // Add any custom options if you need them later
}

/**
 * Server-only helper: reads the Express access token directly from the
 * encrypted Auth.js JWT cookie, bypassing the client-visible session.
 * This keeps the bearer token out of the browser.
 */
async function getServerAccessToken(): Promise<string | null> {
    const headersList = await headers();
    const cookieName = process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token";

    const token = await getToken({
        req: {
            headers: Object.fromEntries(headersList.entries()),
            cookies: Object.fromEntries(
                (headersList.get("cookie") ?? "")
                    .split(";")
                    .map(c => c.trim().split("="))
                    .filter(parts => parts.length === 2)
                    .map(([k, v]) => [k.trim(), v.trim()])
            ),
        } as any,
        secret: process.env.AUTH_SECRET!,
        cookieName,
    });

    return (token?.accessToken as string) ?? null;
}

export async function authenticatedFetch(endpoint: string, options: FetchOptions = {}) {
    // 1. First protect the route / request by checking the session
    const session = await auth();

    if (!session) {
        throw new Error("Unauthorized: No session found");
    }

    // 2. Read the access token from the encrypted JWT (never exposed to clients)
    const accessToken = await getServerAccessToken();

    if (!accessToken) {
        throw new Error("Unauthorized: No access token in session");
    }

    // 3. Safely inject the access token into the headers
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    headers.set("Content-Type", "application/json");

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // 4. Fire the request directly to the Express backend
    return fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
    });
}

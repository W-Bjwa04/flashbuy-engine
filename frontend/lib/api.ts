import { auth } from "@/auth";

interface FetchOptions extends RequestInit {
    // Add any custom options if you need them later
}

export async function authenticatedFetch(endpoint: string, options: FetchOptions = {}) {
    // 1. First protect the route / request by checking the session
    const session = await auth();

    if (!session?.accessToken) {
        throw new Error("Unauthorized: No session token found");
    }

    // 2. Safely inject the access token into the headers
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${session.accessToken}`);
    headers.set("Content-Type", "application/json");

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // 3. Fire the request directly to the Express backend
    return fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
    });
}

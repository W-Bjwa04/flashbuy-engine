"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { signOut } from "@/auth";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required fields." };
    }

    try {
        // NextAuth v5 executes the server-side redirection automatically on success
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/",
        });

        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            if (error.type === "CredentialsSignin") {
                return { error: "Invalid email or password. Please try again" };
            }
            return { error: "Unable to sign in right now. Please try again later." };
        }
        // Next.js redirect system internally utilizes thrown exceptions. 
        // MUST rethrow the error here so Next.js can process the dashboard redirection.
        throw error;
    }
}

export async function logoutAction() {
    await signOut({
        redirectTo: "/login",
    });
}

export async function registerAction(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "All fields are required." };
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            const rawMessage: string = data.message || "Registration failed. Please try again.";

            // Parse backend Zod validation errors:
            // Format: "Validation error:body.field: message, body.field2: message2"
            const validationPrefix = "Validation error:";
            if (rawMessage.startsWith(validationPrefix)) {
                const fieldErrors: Record<string, string> = {};
                const parts = rawMessage.slice(validationPrefix.length).split(", ");
                for (const part of parts) {
                    // part = "body.password: Password must be at least 6 characters"
                    const colonIdx = part.indexOf(": ");
                    if (colonIdx !== -1) {
                        const rawField = part.slice(0, colonIdx).trim(); // "body.password"
                        const message = part.slice(colonIdx + 2).trim();
                        // Strip "body." prefix to get the bare field name
                        const field = rawField.replace(/^body\./, "");
                        fieldErrors[field] = message;
                    }
                }
                const firstError = Object.values(fieldErrors)[0] ?? rawMessage;
                return { error: firstError, fieldErrors };
            }

            return { error: rawMessage };
        }

    } catch (error) {
        console.error("[Registration Server Action Error]:", error);
        return { error: "Something went wrong. Please try again" };
    }

    redirect("/login?registered=true");
}
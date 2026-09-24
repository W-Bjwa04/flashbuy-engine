"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth.action";
import { useSearchParams } from "next/navigation";
import { Zap, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from "next/link";

export function LoginForm() {
    // state contains whatever object is returned by loginAction ({ error: "..." })
    // formAction is tied to our HTML form element
    // isPending replaces your manual setLogging(true/false) states automatically
    const [state, formAction, isPending] = useActionState(loginAction, null);


    // Read URL Search parameters
    const searchParams = useSearchParams();
    const isRegistered = searchParams.get("registered") === "true";

    return (
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
            <div className="mb-8 flex items-center justify-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                    <Zap className="h-6 w-6" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white">FlashBuy</span>
            </div>

            <h1 className="text-xl font-bold text-zinc-100">Sign in to your account</h1>
            <p className="mt-1 text-sm text-zinc-400">Enter your credentials to access flash sales</p>

            {/* Show Account Registration Success Notification */}
            {isRegistered && !state?.error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Account created successfully! Please sign in below.</span>
                </div>
            )}

            {/* Read error messages directly out of the server response state */}
            {state?.error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{state.error}</span>
                </div>
            )}

            <form action={formAction} className="mt-6 space-y-4">
                <div>
                    <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Email Address
                    </label>
                    <input
                        id="login-email"
                        type="email"
                        name="email" // FormData looks for input names, not state values!
                        required
                        placeholder="user@example.com"
                        className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Password
                    </label>
                    <input
                        id="login-password"
                        type="password"
                        name="password" // FormData looks for input names!
                        required
                        placeholder="••••••••"
                        className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue to Flash Sales'}
                </button>
            </form>

            {/* Footer Navigation Link */}
            <p className="mt-6 text-center text-sm text-zinc-400">
                Don't have an account?{" "}
                <Link href="/register" className="text-indigo-400 hover:underline transition">
                    Sign Up
                </Link>
            </p>
        </div>
    );
}

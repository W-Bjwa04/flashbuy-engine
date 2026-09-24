"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth.action";
import Link from "next/link";
import { Zap, Loader2, AlertCircle, User, Mail, Lock, XCircle } from "lucide-react";

export function RegisterForm() {
    // Binds the form elements directly to Server Action
    const [state, formAction, isPending] = useActionState(registerAction, null);

    // Per-field errors returned from the parsed Zod validation response
    const fieldErrors: Record<string, string> = (state as any)?.fieldErrors ?? {};

    // Helper: returns ring/border classes for a field that has an error
    const fieldClass = (field: string) =>
        `w-full rounded-xl border bg-zinc-950 py-3 pl-11 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:ring-1 ${
            fieldErrors[field]
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500"
        }`;

    return (
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">

            {/* Brand Header */}
            <div className="mb-8 flex items-center justify-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                    <Zap className="h-6 w-6" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white">FlashBuy</span>
            </div>

            <h1 className="text-xl font-bold text-zinc-100">Create your account</h1>
            <p className="mt-1 text-sm text-zinc-400">Join us to access exclusive flash sales</p>

            {/* Generic / network error banner (no field breakdown) */}
            {state?.error && Object.keys(fieldErrors).length === 0 && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3.5 text-sm text-rose-400 fade-slide-in">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{state.error}</span>
                </div>
            )}

            {/* Native Form Execution */}
            <form action={formAction} className="mt-6 space-y-5">

                {/* Full Name Input */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="register-name"
                        className={`block text-xs font-semibold uppercase tracking-wider transition ${
                            fieldErrors.name ? "text-rose-400" : "text-zinc-400"
                        }`}
                    >
                        Full Name
                    </label>
                    <div className="relative">
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-4 transition ${fieldErrors.name ? "text-rose-500" : "text-zinc-500"}`}>
                            <User className="h-4 w-4" />
                        </span>
                        <input
                            id="register-name"
                            type="text"
                            name="name"
                            required
                            placeholder="Zain Tahir"
                            className={fieldClass("name")}
                        />
                    </div>
                    {fieldErrors.name && (
                        <p className="flex items-center gap-1.5 text-xs text-rose-400 fade-slide-in">
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                            {fieldErrors.name}
                        </p>
                    )}
                </div>

                {/* Email Address Input */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="register-email"
                        className={`block text-xs font-semibold uppercase tracking-wider transition ${
                            fieldErrors.email ? "text-rose-400" : "text-zinc-400"
                        }`}
                    >
                        Email Address
                    </label>
                    <div className="relative">
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-4 transition ${fieldErrors.email ? "text-rose-500" : "text-zinc-500"}`}>
                            <Mail className="h-4 w-4" />
                        </span>
                        <input
                            id="register-email"
                            type="email"
                            name="email"
                            required
                            placeholder="user@example.com"
                            className={fieldClass("email")}
                        />
                    </div>
                    {fieldErrors.email && (
                        <p className="flex items-center gap-1.5 text-xs text-rose-400 fade-slide-in">
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                            {fieldErrors.email}
                        </p>
                    )}
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="register-password"
                        className={`block text-xs font-semibold uppercase tracking-wider transition ${
                            fieldErrors.password ? "text-rose-400" : "text-zinc-400"
                        }`}
                    >
                        Password
                    </label>
                    <div className="relative">
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-4 transition ${fieldErrors.password ? "text-rose-500" : "text-zinc-500"}`}>
                            <Lock className="h-4 w-4" />
                        </span>
                        <input
                            id="register-password"
                            type="password"
                            name="password"
                            required
                            placeholder="••••••••"
                            className={fieldClass("password")}
                        />
                    </div>
                    {fieldErrors.password ? (
                        <p className="flex items-center gap-1.5 text-xs text-rose-400 fade-slide-in">
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                            {fieldErrors.password}
                        </p>
                    ) : (
                        <p className="text-xs text-zinc-600">Must be at least 6 characters</p>
                    )}
                </div>

                {/* Form Action Submit Button */}
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Creating Account...</span>
                        </>
                    ) : (
                        <span>Sign Up</span>
                    )}
                </button>
            </form>

            {/* Footer Navigation Link */}
            <p className="mt-6 text-center text-sm text-zinc-400">
                Already have an account?{" "}
                <Link href="/login" className="text-indigo-400 hover:underline transition">
                    Sign In
                </Link>
            </p>

        </div>
    );
}

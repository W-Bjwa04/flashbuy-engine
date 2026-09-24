"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth.action";
import Link from "next/link";
import { Zap, Loader2, AlertCircle, User, Mail, Lock, XCircle, ArrowRight } from "lucide-react";

export function RegisterForm() {
    const [state, formAction, isPending] = useActionState(registerAction, null);

    const fieldErrors: Record<string, string> = (state as any)?.fieldErrors ?? {};

    const fieldClass = (field: string) =>
        `w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
            fieldErrors[field]
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
        }`;

    return (
        <div className="w-full max-w-sm">
            {/* Brand */}
            <div className="mb-8 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/20">
                    <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900">FlashBuy</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create an account</h1>
            <p className="mt-1 text-sm text-slate-500">Join to access exclusive flash sales</p>

            {/* Generic / network error */}
            {state?.error && Object.keys(fieldErrors).length === 0 && (
                <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600 fade-slide-in">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{state.error}</span>
                </div>
            )}

            <form action={formAction} className="mt-6 space-y-4">

                {/* Full Name */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="register-name"
                        className={`block text-xs font-semibold uppercase tracking-wider ${fieldErrors.name ? "text-red-500" : "text-slate-500"}`}
                    >
                        Full Name
                    </label>
                    <div className="relative">
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${fieldErrors.name ? "text-red-400" : "text-slate-400"}`}>
                            <User className="h-4 w-4" />
                        </span>
                        <input
                            id="register-name"
                            type="text"
                            name="name"
                            required
                            placeholder="Your name"
                            className={fieldClass("name")}
                        />
                    </div>
                    {fieldErrors.name && (
                        <p className="flex items-center gap-1.5 text-xs text-red-500 fade-slide-in">
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                            {fieldErrors.name}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="register-email"
                        className={`block text-xs font-semibold uppercase tracking-wider ${fieldErrors.email ? "text-red-500" : "text-slate-500"}`}
                    >
                        Email Address
                    </label>
                    <div className="relative">
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${fieldErrors.email ? "text-red-400" : "text-slate-400"}`}>
                            <Mail className="h-4 w-4" />
                        </span>
                        <input
                            id="register-email"
                            type="email"
                            name="email"
                            required
                            placeholder="you@example.com"
                            className={fieldClass("email")}
                        />
                    </div>
                    {fieldErrors.email && (
                        <p className="flex items-center gap-1.5 text-xs text-red-500 fade-slide-in">
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                            {fieldErrors.email}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="register-password"
                        className={`block text-xs font-semibold uppercase tracking-wider ${fieldErrors.password ? "text-red-500" : "text-slate-500"}`}
                    >
                        Password
                    </label>
                    <div className="relative">
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${fieldErrors.password ? "text-red-400" : "text-slate-400"}`}>
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
                        <p className="flex items-center gap-1.5 text-xs text-red-500 fade-slide-in">
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                            {fieldErrors.password}
                        </p>
                    ) : (
                        <p className="text-xs text-slate-400">At least 6 characters</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Creating account...</span>
                        </>
                    ) : (
                        <>
                            <span>Create account</span>
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </>
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
                    Sign in
                </Link>
            </p>
        </div>
    );
}

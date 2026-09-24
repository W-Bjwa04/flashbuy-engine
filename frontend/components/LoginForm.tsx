"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth.action";
import { useSearchParams } from "next/navigation";
import { Zap, Loader2, CheckCircle2, Mail, Lock, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginAction, null);

    const searchParams = useSearchParams();
    const isRegistered = searchParams.get("registered") === "true";

    const isCredentialError = state?.error === "Invalid email or password. Please try again";
    const isServiceError = state?.error && !isCredentialError;

    const inputClass = (hasError: boolean) =>
        `w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${hasError
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

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue</p>

            {/* Success banner */}
            {isRegistered && !state?.error && (
                <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700 fade-slide-in">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Account created — sign in below</span>
                </div>
            )}

            {/* Service error banner */}
            {isServiceError && (
                <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600 fade-slide-in">
                    <XCircle className="h-4 w-4 shrink-0" />
                    <span>{state!.error}</span>
                </div>
            )}

            <form action={formAction} className="mt-6 space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="login-email"
                        className={`block text-xs font-semibold uppercase tracking-wider ${isCredentialError ? "text-red-500" : "text-slate-500"}`}
                    >
                        Email
                    </label>
                    <div className="relative">
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${isCredentialError ? "text-red-400" : "text-slate-400"}`}>
                            <Mail className="h-4 w-4" />
                        </span>
                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            required
                            autoComplete="email"
                            placeholder="you@example.com"
                            className={inputClass(isCredentialError)}
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="login-password"
                        className={`block text-xs font-semibold uppercase tracking-wider ${isCredentialError ? "text-red-500" : "text-slate-500"}`}
                    >
                        Password
                    </label>
                    <div className="relative">
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${isCredentialError ? "text-red-400" : "text-slate-400"}`}>
                            <Lock className="h-4 w-4" />
                        </span>
                        <input
                            id="login-password"
                            type="password"
                            name="password"
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className={inputClass(isCredentialError)}
                        />
                    </div>
                    {isCredentialError && (
                        <p className="flex items-center gap-1.5 text-xs text-red-500 fade-slide-in">
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                            {state!.error}
                        </p>
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
                            <span>Signing in...</span>
                        </>
                    ) : (
                        <>
                            <span>Sign in</span>
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </>
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                No account?{" "}
                <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
                    Create one
                </Link>
            </p>
        </div>
    );
}

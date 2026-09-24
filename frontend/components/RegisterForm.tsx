"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth.action";
import Link from "next/link";
import { Zap, Loader2, AlertCircle, User, Mail, Lock } from "lucide-react";

export function RegisterForm() {
    // Binds the form elements directly to Server Action
    const [state, formAction, isPending] = useActionState(registerAction, null);

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

            {/* Error Alert Display */}
            {state?.error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{state.error}</span>
                </div>
            )}

            {/* Native Form Execution */}
            <form action={formAction} className="mt-6 space-y-4">

                {/* Full Name Input */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Full Name
                    </label>
                    <div className="relative mt-1.5">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                            <User className="h-4 w-4" />
                        </span>
                        <input
                            type="text"
                            name="name" // formData.get("name") in  Server Action
                            required
                            placeholder="Zain Tahir"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Email Address Input */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Email Address
                    </label>
                    <div className="relative mt-1.5">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                            <Mail className="h-4 w-4" />
                        </span>
                        <input
                            type="email"
                            name="email" // Matches formData.get("email") in Server Action
                            required
                            placeholder="user@example.com"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Password
                    </label>
                    <div className="relative mt-1.5">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                            <Lock className="h-4 w-4" />
                        </span>
                        <input
                            type="password"
                            name="password" // Matches formData.get("password") in Server Action
                            required
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
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

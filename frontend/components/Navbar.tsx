import Link from "next/link";
import { auth } from "@/auth";
import { Zap, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth.action";
import { NavBell } from "./NavBell";

export async function Navbar() {
    const session = await auth();
    const userEmail = session?.user?.email;
    const userInitial = userEmail?.charAt(0).toUpperCase() ?? "?";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Brand */}
                <Link href="/" className="group flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm transition group-hover:bg-indigo-700">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-base font-black tracking-tight text-slate-900">FlashBuy</span>
                </Link>

                {/* Nav links */}
                {session && (
                    <nav className="hidden md:flex items-center gap-0.5">
                        <NavLink href="/">Marketplace</NavLink>
                        <NavLink href="/flash-sales">Flash Sales</NavLink>
                        <NavLink href="/orders">Orders</NavLink>
                    </nav>
                )}

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {session ? (
                        <>
                            {/* Client-side socket bell — must be a separate Client Component */}
                            <NavBell />

                            {/* Divider */}
                            <div className="h-5 w-px bg-slate-200" />

                            {/* Avatar + email */}
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">
                                    {userInitial}
                                </div>
                                <span className="max-w-35 truncate text-xs text-slate-600 font-medium">
                                    {userEmail}
                                </span>
                            </div>

                            {/* Sign out */}
                            <form action={logoutAction}>
                                <button
                                    type="submit"
                                    title="Sign out"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                            >
                                Get started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
            {children}
        </Link>
    );
}

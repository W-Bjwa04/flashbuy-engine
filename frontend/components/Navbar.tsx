import Link from "next/link";
import { auth } from "@/auth";
import { Zap, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth.action";

export async function Navbar() {
    const session = await auth();
    const userEmail = session?.user?.email;
    const userInitial = userEmail?.charAt(0).toUpperCase() ?? "?";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Brand */}
                <Link href="/" className="group flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/30 transition group-hover:bg-indigo-500">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-base font-black tracking-tight text-white">FlashBuy</span>
                </Link>

                {/* Nav links — only for authenticated users */}
                {session && (
                    <nav className="hidden md:flex items-center gap-0.5">
                        <NavLink href="/">Marketplace</NavLink>
                        <NavLink href="/orders">Orders</NavLink>
                    </nav>
                )}

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {session ? (
                        <>
                            {/* Avatar + email */}
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-bold text-indigo-400 ring-1 ring-indigo-500/30">
                                    {userInitial}
                                </div>
                                <span className="max-w-35 truncate text-xs text-zinc-400">
                                    {userEmail}
                                </span>
                            </div>

                            {/* Sign out */}
                            <form action={logoutAction}>
                                <button
                                    type="submit"
                                    title="Sign out"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-rose-400"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500"
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
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100"
        >
            {children}
        </Link>
    );
}

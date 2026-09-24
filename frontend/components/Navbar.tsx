import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Zap, Bell, LogOut, User } from "lucide-react";
import { logoutAction } from "@/actions/auth.action";

export async function Navbar() {
    const session = await auth();

    const userEmail = session?.user?.email || "Guest User";

    // Extract first letter of email for a clean avatar fallback
    const userInitial = userEmail.charAt(0).toUpperCase();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* Left: Branding & Navigation */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition">
                                <Zap className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-white">FlashBuy</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-zinc-200 hover:text-indigo-400 rounded-lg hover:bg-zinc-900 transition">
                                Dashboard
                            </Link>
                            <Link href="/sales" className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-indigo-400 rounded-lg hover:bg-zinc-900 transition">
                                Flash Sales
                            </Link>
                            <Link href="/orders" className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-indigo-400 rounded-lg hover:bg-zinc-900 transition">
                                Orders
                            </Link>
                        </div>
                    </div>

                    {/* Right: Actions (Notification, Profile & Logout) */}
                    <div className="flex items-center gap-4">

                        {/* Bell Icon Button with Notification Dot */}
                        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition outline-none">
                            <Bell className="h-4 w-4" />
                            {/* Ping notification marker */}
                            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                        </button>

                        {/* Simple User Profile Pill */}
                        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 pl-2 pr-3 py-1 text-sm font-medium text-zinc-300">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs">
                                {userInitial}
                            </div>
                            <span className="max-w-[120px] truncate text-xs text-zinc-400">
                                {userEmail}
                            </span>
                        </div>

                        {/* Logout Form & Button using Next.js Server Actions */}
                        <form
                            action={logoutAction}
                        >
                            <button
                                type="submit"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-950/30 bg-rose-950/10 text-rose-400 hover:bg-rose-600 hover:text-white transition outline-none"
                                title="Sign Out"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </form>

                    </div>

                </div>
            </div>
        </nav>
    );
}


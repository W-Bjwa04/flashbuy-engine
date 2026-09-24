"use client";

import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

export function NavBell() {
    const { isConnected, isConnecting, toggleConnection } = useSocket();

    return (
        <button
            onClick={toggleConnection}
            title={
                isConnected
                    ? "Live updates connected — click to disconnect"
                    : "Click to enable live order updates"
            }
            className={`relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                isConnected
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    : isConnecting
                    ? "border-amber-200 bg-amber-50 text-amber-600"
                    : "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
        >
            {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isConnected ? (
                <>
                    <BellRing className="h-4 w-4" />
                    {/* Live indicator dot */}
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                </>
            ) : (
                <Bell className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle live notifications</span>
        </button>
    );
}

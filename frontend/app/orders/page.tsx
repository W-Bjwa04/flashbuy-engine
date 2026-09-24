"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSocket, OrderNotificationRecord } from "@/context/SocketContext";
import { getMyOrdersAction } from "@/actions/order.action";
import { UserOrder } from "@/types/order";
import { UserOrderCard } from "@/components/UserOrderCard";
import { OrderProgressCard } from "@/components/OrderProgressCard";
import {
    ShoppingBag,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    Clock,
    RefreshCw,
    PackageCheck,
    AlertCircle,
    Layers,
} from "lucide-react";

export default function OrdersPage() {
    const [orders, setOrders] = useState<UserOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"completed" | "live" | "all">("completed");
    const [isRefreshing, startTransition] = useTransition();

    const { notificationList } = useSocket();

    // Active in-flight orders (pending or processing) from WebSocket session
    const inFlightOrders = notificationList.filter(
        (n) => n.status === "PENDING" || n.status === "PROCESSING"
    );

    const loadCompletedOrders = async () => {
        setIsLoading(true);
        setError(null);
        const res = await getMyOrdersAction("COMPLETED");
        if (res.success && res.data) {
            setOrders(res.data);
        } else {
            setError(res.error || "Failed to load orders");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadCompletedOrders();
    }, []);

    // Refresh completed orders whenever a WebSocket notification finishes as COMPLETED
    useEffect(() => {
        const latest = notificationList[0];
        if (latest && latest.status === "COMPLETED") {
            startTransition(async () => {
                const res = await getMyOrdersAction("COMPLETED");
                if (res.success && res.data) {
                    setOrders(res.data);
                }
            });
        }
    }, [notificationList]);

    const handleManualRefresh = () => {
        startTransition(async () => {
            await loadCompletedOrders();
        });
    };

    return (
        <main className="min-h-[calc(100vh-3.5rem)] bg-slate-50 py-8">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Header with Title & Refresh */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Marketplace
                            </Link>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            My Orders
                        </h1>
                        <p className="text-xs text-slate-500">
                            View completed orders and track live order progress in real-time.
                        </p>
                    </div>

                    {/* Actions: Status Filter Tabs & Refresh Button */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Toggle Tabs */}
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setActiveTab("completed")}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                    activeTab === "completed"
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Completed ({orders.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("live")}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                    activeTab === "live"
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <Clock className="h-3.5 w-3.5" />
                                Live Queue ({notificationList.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("all")}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                    activeTab === "all"
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <Layers className="h-3.5 w-3.5" />
                                All
                            </button>
                        </div>

                        {/* Manual Refresh */}
                        <button
                            type="button"
                            onClick={handleManualRefresh}
                            disabled={isLoading || isRefreshing}
                            title="Refresh orders"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* Banner when there are actively in-flight orders */}
                {inFlightOrders.length > 0 && activeTab === "completed" && (
                    <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-xs text-indigo-900 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600"></span>
                            </span>
                            <span className="font-medium">
                                You have <strong>{inFlightOrders.length}</strong> order(s) currently being processed by background workers.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveTab("live")}
                            className="font-bold text-indigo-700 underline hover:text-indigo-900"
                        >
                            View Live Status
                        </button>
                    </div>
                )}

                {/* Content Area */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">
                        <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
                        <p className="mt-3 text-xs font-medium text-slate-500">Loading your completed orders…</p>
                    </div>
                ) : error ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                            <h3 className="font-bold">Error loading orders</h3>
                            <p className="text-xs text-red-600 mt-0.5">{error}</p>
                            <button
                                type="button"
                                onClick={loadCompletedOrders}
                                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">

                        {/* Completed Orders Section (Shown in 'completed' or 'all' tabs) */}
                        {(activeTab === "completed" || activeTab === "all") && (
                            <section className="space-y-4">
                                {activeTab === "all" && (
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                                        Completed Orders ({orders.length})
                                    </h2>
                                )}

                                {orders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                                            <PackageCheck className="h-6 w-6" />
                                        </div>
                                        <h3 className="mt-4 text-base font-bold text-slate-900">No completed orders yet</h3>
                                        <p className="mt-1 max-w-sm text-xs text-slate-500">
                                            Once your order finishes background processing and is secured in the database, it will appear here.
                                        </p>
                                        <Link
                                            href="/"
                                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                        >
                                            <ShoppingBag className="h-4 w-4" />
                                            Browse Deals
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {orders.map((order) => (
                                            <UserOrderCard key={order.id} order={order} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Live Queue Section (Shown in 'live' or 'all' tabs) */}
                        {(activeTab === "live" || activeTab === "all") && (
                            <section className="space-y-4">
                                {activeTab === "all" && (
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 pt-4">
                                        Live Activity ({notificationList.length})
                                    </h2>
                                )}

                                {notificationList.length === 0 ? (
                                    activeTab === "live" && (
                                        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                                            <Clock className="h-8 w-8 text-slate-400" />
                                            <h3 className="mt-4 text-base font-bold text-slate-900">No active orders in live queue</h3>
                                            <p className="mt-1 max-w-sm text-xs text-slate-500">
                                                Active purchases from the current session will track their real-time stage transitions here.
                                            </p>
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-4">
                                        {notificationList.map((order: OrderNotificationRecord) => (
                                            <OrderProgressCard key={order.trackingId} order={order} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                    </div>
                )}
            </div>
        </main>
    );
}

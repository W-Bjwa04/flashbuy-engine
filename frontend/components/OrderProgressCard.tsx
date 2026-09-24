"use client";

import { useState } from "react";
import { OrderNotificationRecord } from "@/context/SocketContext";
import {
    CheckCircle2,
    XCircle,
    Loader2,
    Copy,
    Check,
    Clock,
    Layers,
    Database,
    AlertCircle,
    ArrowRight,
    ShieldCheck,
    Cpu,
} from "lucide-react";

interface OrderProgressCardProps {
    order: OrderNotificationRecord;
}

export function OrderProgressCard({ order }: OrderProgressCardProps) {
    const [copiedTracking, setCopiedTracking] = useState(false);
    const [copiedOrder, setCopiedOrder] = useState(false);

    const isPending = order.status === "PENDING";
    const isProcessing = order.status === "PROCESSING";
    const isCompleted = order.status === "COMPLETED";
    const isFailed = order.status === "FAILED";

    function copyToClipboard(text: string, type: "tracking" | "order") {
        navigator.clipboard.writeText(text);
        if (type === "tracking") {
            setCopiedTracking(true);
            setTimeout(() => setCopiedTracking(false), 2000);
        } else {
            setCopiedOrder(true);
            setTimeout(() => setCopiedOrder(false), 2000);
        }
    }

    // Step state helpers
    const getStep1State = () => {
        if (isFailed && order.history?.length === 1) return "completed";
        return "completed"; // Once created, stock gatekeeper reservation is complete
    };

    const getStep2State = () => {
        if (isPending) return "upcoming";
        if (isProcessing) return "active";
        if (isCompleted) return "completed";
        if (isFailed) return "failed";
        return "upcoming";
    };

    const getStep3State = () => {
        if (isCompleted) return "completed";
        if (isFailed) return "failed";
        return "upcoming";
    };

    const step1 = getStep1State();
    const step2 = getStep2State();
    const step3 = getStep3State();

    const formattedTime = new Date(order.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
            {/* Top header strip: Status Badge + Tracking ID + Timestamp */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Status Pill */}
                    {isPending && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                            </span>
                            Queued in Redis
                        </span>
                    )}
                    {isProcessing && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Worker Processing
                        </span>
                    )}
                    {isCompleted && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Order Completed
                        </span>
                    )}
                    {isFailed && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                            <XCircle className="h-3.5 w-3.5" />
                            Order Aborted
                        </span>
                    )}

                    {/* Tracking ID with Copy */}
                    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                        <span className="text-slate-400 font-medium">Tracking:</span>
                        <span className="font-mono font-semibold">{order.trackingId.slice(0, 13)}…</span>
                        <button
                            type="button"
                            onClick={() => copyToClipboard(order.trackingId, "tracking")}
                            title="Copy Tracking ID"
                            className="ml-1 text-slate-400 hover:text-slate-700 transition"
                        >
                            {copiedTracking ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formattedTime}</span>
                </div>
            </div>

            {/* Visual Step-by-Step Progress Pipeline */}
            <div className="my-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                    
                    {/* Step 1 */}
                    <div className="relative flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900">1. Stock Secured</p>
                            <p className="text-[11px] text-slate-500">Atomic Redis Lua reservation confirmed</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className={`relative flex items-start gap-3 rounded-xl border p-3.5 transition ${
                        step2 === "active"
                            ? "border-indigo-200 bg-indigo-50/50 shadow-sm"
                            : step2 === "completed"
                            ? "border-slate-100 bg-slate-50/60"
                            : step2 === "failed"
                            ? "border-red-200 bg-red-50/40"
                            : "border-slate-100 bg-white opacity-60"
                    }`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            step2 === "active"
                                ? "bg-indigo-600 text-white shadow-sm"
                                : step2 === "completed"
                                ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                                : step2 === "failed"
                                ? "bg-red-100 text-red-700 ring-1 ring-red-200"
                                : "bg-slate-100 text-slate-400"
                        }`}>
                            {step2 === "active" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : step2 === "completed" ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : step2 === "failed" ? (
                                <XCircle className="h-4 w-4" />
                            ) : (
                                <Cpu className="h-4 w-4" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900">2. Worker Queue</p>
                            <p className="text-[11px] text-slate-500">
                                {step2 === "active"
                                    ? "BullMQ worker persisting transaction"
                                    : step2 === "completed"
                                    ? "Queue job dispatched & processed"
                                    : step2 === "failed"
                                    ? "Worker execution failed"
                                    : "Awaiting worker pickup"}
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className={`relative flex items-start gap-3 rounded-xl border p-3.5 transition ${
                        step3 === "completed"
                            ? "border-emerald-200 bg-emerald-50/40 shadow-sm"
                            : step3 === "failed"
                            ? "border-red-200 bg-red-50/40"
                            : "border-slate-100 bg-white opacity-60"
                    }`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            step3 === "completed"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : step3 === "failed"
                                ? "bg-red-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-400"
                        }`}>
                            {step3 === "completed" ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : step3 === "failed" ? (
                                <XCircle className="h-4 w-4" />
                            ) : (
                                <Database className="h-4 w-4" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900">3. DB Confirmation</p>
                            <p className="text-[11px] text-slate-500">
                                {step3 === "completed"
                                    ? "PostgreSQL database record written"
                                    : step3 === "failed"
                                    ? "Order rejected & stock restored"
                                    : "Final ledger commit pending"}
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Error banner if failed */}
            {isFailed && order.reason && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <div>
                        <span className="font-bold">Failure Reason: </span>
                        <span>{order.reason}</span>
                    </div>
                </div>
            )}

            {/* Bottom Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-400">Product:</span>
                    <span className="font-mono text-slate-700">{order.productId}</span>
                </div>

                {order.orderId ? (
                    <div className="flex items-center gap-2">
                        <Database className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-slate-400">Order ID:</span>
                        <code className="rounded bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-700 border border-slate-200">
                            {order.orderId}
                        </code>
                        <button
                            type="button"
                            onClick={() => copyToClipboard(order.orderId!, "order")}
                            title="Copy Order ID"
                            className="text-slate-400 hover:text-slate-700 transition"
                        >
                            {copiedOrder ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Awaiting DB Order Record…</span>
                    </div>
                )}
            </div>
        </article>
    );
}

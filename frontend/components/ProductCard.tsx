"use client";

import { Zap, ShoppingBag, EyeOff, CheckCircle2, XCircle, Loader2, Sparkles, Flame } from "lucide-react";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { PurchaseModal } from "./PurchaseModal";

function getFlashStatus(product: Product) {
    const now = new Date();
    const isFlashActive = !!(
        product.is_flash_sale &&
        product.flash_start_at &&
        product.flash_end_at &&
        now >= new Date(product.flash_start_at) &&
        now <= new Date(product.flash_end_at)
    );
    const isFlashExpired = !!(
        product.is_flash_sale &&
        !isFlashActive &&
        product.flash_end_at &&
        now > new Date(product.flash_end_at)
    );
    const isFlashUpcoming = !!(
        product.is_flash_sale &&
        !isFlashActive &&
        product.flash_start_at &&
        now < new Date(product.flash_start_at)
    );
    return { isFlashActive, isFlashExpired, isFlashUpcoming };
}

export function ProductCard({ product }: { product: Product }) {
    const isOutOfStock = product.official_stock === 0;
    const isLowStock = !isOutOfStock && product.official_stock < 30;

    const [{ isFlashActive, isFlashExpired, isFlashUpcoming }, setFlashStatus] = useState(
        () => getFlashStatus(product)
    );
    const [showModal, setShowModal] = useState(false);

    // Track all orders placed for this specific product
    const [myTrackingIds, setMyTrackingIds] = useState<string[]>([]);

    const { notifications } = useSocket();

    function onOrderAccepted(trackingId: string) {
        setMyTrackingIds((prev) => [trackingId, ...prev]);
    }

    useEffect(() => {
        setFlashStatus(getFlashStatus(product));
        if (!product.is_flash_sale) return;
        const now = new Date();
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (const boundary of [product.flash_start_at, product.flash_end_at]) {
            if (!boundary) continue;
            const ms = new Date(boundary).getTime() - now.getTime();
            if (ms > 0) timers.push(setTimeout(() => setFlashStatus(getFlashStatus(product)), ms + 100));
        }
        return () => timers.forEach(clearTimeout);
    }, [product]);

    const isDisabled = isOutOfStock || isFlashExpired;

    // Latest live status for this product's most recent order
    const latestTracking = myTrackingIds[0] ? notifications[myTrackingIds[0]] : null;

    const orderStatusConfig = latestTracking && {
        PENDING: { label: "Pending", cls: "text-amber-600 bg-amber-50 border-amber-200", icon: <Loader2 className="h-2.5 w-2.5 animate-spin" /> },
        PROCESSING: { label: "Processing", cls: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: <Loader2 className="h-2.5 w-2.5 animate-spin" /> },
        COMPLETED: { label: "Completed", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="h-2.5 w-2.5" /> },
        FAILED: { label: "Failed", cls: "text-red-600 bg-red-50 border-red-200", icon: <XCircle className="h-2.5 w-2.5" /> },
    }[latestTracking.status];

    return (
        <>
            <article
                className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
                    isFlashActive
                        ? "border-amber-300 ring-1 ring-amber-200/70 hover:border-amber-400"
                        : "border-slate-200 hover:border-slate-300"
                }`}
            >
                {/* Prominent Flash Banner on Product Card */}
                {product.is_flash_sale && (
                    <div
                        className={`flex items-center justify-between px-4 py-1.5 text-xs font-bold transition ${
                            isFlashActive
                                ? "bg-amber-500 text-white shadow-inner"
                                : isFlashExpired
                                ? "bg-slate-100 text-slate-400 border-b border-slate-200"
                                : "bg-indigo-50 text-indigo-700 border-b border-indigo-100"
                        }`}
                    >
                        <div className="flex items-center gap-1.5">
                            {isFlashActive ? (
                                <>
                                    <Flame className="h-3.5 w-3.5 fill-current animate-pulse" />
                                    <span className="tracking-wide uppercase text-[11px] font-black">
                                        Flash Sale · Live
                                    </span>
                                </>
                            ) : isFlashExpired ? (
                                <>
                                    <Zap className="h-3.5 w-3.5" />
                                    <span className="tracking-wide uppercase text-[11px] font-semibold">
                                        Flash Sale Ended
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span className="tracking-wide uppercase text-[11px] font-semibold">
                                        Upcoming Flash Sale
                                    </span>
                                </>
                            )}
                        </div>

                        {isFlashActive && (
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                            </span>
                        )}
                    </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                    {/* Header Row: Title & Badges */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1">
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                                {product.title}
                            </h3>
                            <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                                {product.description}
                            </p>
                        </div>

                        {/* Status badge when not in flash sale banner */}
                        {!product.is_flash_sale && isOutOfStock && (
                            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Sold out
                            </span>
                        )}
                    </div>

                    {/* Live order status strip — only when we have a tracking result */}
                    {latestTracking && orderStatusConfig && (
                        <div className={`mt-3 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold fade-slide-in ${orderStatusConfig.cls}`}>
                            {orderStatusConfig.icon}
                            <span>Order {orderStatusConfig.label}</span>
                            <span className="ml-auto font-mono opacity-60">{latestTracking.trackingId.slice(0, 8)}…</span>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                        <div>
                            <span className="text-xl font-black text-slate-900">
                                ${parseFloat(product.price).toFixed(2)}
                            </span>
                            <div className="mt-0.5 flex items-center gap-1.5">
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        isOutOfStock
                                            ? "bg-red-400"
                                            : isLowStock
                                            ? "bg-amber-400"
                                            : "bg-emerald-500"
                                    }`}
                                />
                                <span className="text-[11px] text-slate-400">
                                    {isOutOfStock ? "Out of stock" : `${product.official_stock} left`}
                                </span>
                            </div>
                        </div>

                        {/* Claim / Buy button */}
                        {isDisabled ? (
                            <div
                                aria-disabled="true"
                                className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-400 select-none cursor-not-allowed"
                            >
                                <EyeOff className="h-3.5 w-3.5" />
                                {isOutOfStock ? "Unavailable" : "Ended"}
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowModal(true)}
                                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-95 ${
                                    isFlashActive
                                        ? "bg-amber-600 hover:bg-amber-700"
                                        : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                            >
                                <ShoppingBag className="h-3.5 w-3.5" />
                                {isFlashActive ? "Claim Flash Deal" : "Claim"}
                            </button>
                        )}
                    </div>
                </div>
            </article>

            {showModal && (
                <PurchaseModal
                    product={product}
                    onClose={() => setShowModal(false)}
                    onOrderAccepted={onOrderAccepted}
                />
            )}
        </>
    );
}

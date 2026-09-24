"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, ShoppingBag, Loader2, CheckCircle2, XCircle, Zap, Package } from "lucide-react";
import { placeOrderAction } from "@/actions/order.action";
import { useSocket } from "@/context/SocketContext";
import { Product } from "@/types/product";

interface PurchaseModalProps {
    product: Product;
    onClose: () => void;
    onOrderAccepted?: (trackingId: string) => void;
}

type OrderState =
    | { phase: "idle" }
    | { phase: "submitting" }
    | { phase: "accepted"; trackingId: string }
    | { phase: "error"; message: string };

export function PurchaseModal({ product, onClose, onOrderAccepted }: PurchaseModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [qtyError, setQtyError] = useState<string | null>(null);
    const [orderState, setOrderState] = useState<OrderState>({ phase: "idle" });
    const [isPending, startTransition] = useTransition();
    const overlayRef = useRef<HTMLDivElement>(null);

    const { notifications } = useSocket();

    const price = parseFloat(product.price);
    const maxQty = Math.min(product.official_stock, 99);
    const totalAmount = price * quantity;

    // Live status update from websocket — keyed by trackingId
    const liveStatus =
        orderState.phase === "accepted"
            ? notifications[orderState.trackingId] ?? null
            : null;

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    function validateQty(val: number) {
        if (!Number.isInteger(val) || val < 1) {
            setQtyError("Quantity must be at least 1");
            return false;
        }
        if (val > maxQty) {
            setQtyError(`Only ${maxQty} in stock`);
            return false;
        }
        setQtyError(null);
        return true;
    }

    function handleQtyChange(val: string) {
        const n = parseInt(val, 10);
        setQuantity(isNaN(n) ? 1 : n);
        validateQty(isNaN(n) ? 1 : n);
    }

    function handleSubmit() {
        if (!validateQty(quantity)) return;
        setOrderState({ phase: "submitting" });

        startTransition(async () => {
            const result = await placeOrderAction(product.id, quantity, totalAmount);
            if (result.success && result.trackingId) {
                setOrderState({ phase: "accepted", trackingId: result.trackingId });
                onOrderAccepted?.(result.trackingId);
            } else {
                setOrderState({ phase: "error", message: result.error ?? "Unknown error" });
            }
        });
    }

    const statusColors: Record<string, string> = {
        PENDING: "text-amber-600 bg-amber-50 border-amber-200",
        PROCESSING: "text-indigo-600 bg-indigo-50 border-indigo-200",
        COMPLETED: "text-emerald-700 bg-emerald-50 border-emerald-200",
        FAILED: "text-red-600 bg-red-50 border-red-200",
    };

    return (
        /* Backdrop */
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
        >
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                            <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Place Order</h2>
                            <p className="text-xs text-slate-500 line-clamp-1">{product.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Accepted — show tracking + live status */}
                    {orderState.phase === "accepted" ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-emerald-700">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-semibold">Order accepted!</p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Tracking ID</span>
                                    <code className="font-mono text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                        {orderState.trackingId.slice(0, 8)}…
                                    </code>
                                </div>
                                {liveStatus ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500">Status</span>
                                            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${statusColors[liveStatus.status] ?? "text-slate-600 bg-slate-100 border-slate-200"}`}>
                                                {liveStatus.status === "PROCESSING" && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                                                {liveStatus.status === "COMPLETED" && <CheckCircle2 className="h-2.5 w-2.5" />}
                                                {liveStatus.status === "FAILED" && <XCircle className="h-2.5 w-2.5" />}
                                                {liveStatus.status}
                                            </span>
                                        </div>
                                        {liveStatus.reason && (
                                            <p className="text-xs text-red-500">{liveStatus.reason}</p>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        <span>Waiting for live status update…</span>
                                    </div>
                                )}
                            </div>

                            {!liveStatus || liveStatus.status === "PENDING" || liveStatus.status === "PROCESSING" ? (
                                <p className="text-xs text-slate-400 text-center">
                                    Connect the bell 🔔 to receive live updates
                                </p>
                            ) : null}

                            <button
                                onClick={onClose}
                                className="w-full rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Product summary */}
                            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500">
                                    {product.is_flash_sale ? (
                                        <Zap className="h-4 w-4 text-amber-500 fill-current" />
                                    ) : (
                                        <Package className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 truncate">{product.title}</p>
                                    <p className="text-xs text-slate-500">${price.toFixed(2)} per unit · {product.official_stock} in stock</p>
                                </div>
                            </div>

                            {/* Error banner */}
                            {orderState.phase === "error" && (
                                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 fade-slide-in">
                                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                    {orderState.message}
                                </div>
                            )}

                            {/* Quantity input */}
                            <div className="space-y-1.5">
                                <label htmlFor="order-qty" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleQtyChange(String(Math.max(1, quantity - 1)))}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 text-lg font-medium"
                                    >
                                        −
                                    </button>
                                    <input
                                        id="order-qty"
                                        type="number"
                                        min={1}
                                        max={maxQty}
                                        value={quantity}
                                        onChange={(e) => handleQtyChange(e.target.value)}
                                        className={`w-full rounded-lg border py-2 text-center text-sm font-semibold text-slate-900 outline-none transition focus:ring-2 ${
                                            qtyError
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleQtyChange(String(Math.min(maxQty, quantity + 1)))}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 text-lg font-medium"
                                    >
                                        +
                                    </button>
                                </div>
                                {qtyError && (
                                    <p className="flex items-center gap-1 text-xs text-red-500 fade-slide-in">
                                        <XCircle className="h-3 w-3 shrink-0" />
                                        {qtyError}
                                    </p>
                                )}
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                <span className="text-xs text-slate-500">Total</span>
                                <span className="text-base font-black text-slate-900">${totalAmount.toFixed(2)}</span>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={isPending || !!qtyError}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Placing order…
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="h-4 w-4" />
                                        Confirm — ${totalAmount.toFixed(2)}
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

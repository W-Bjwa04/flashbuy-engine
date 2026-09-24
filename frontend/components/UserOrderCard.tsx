"use client";

import { useState } from "react";
import { UserOrder } from "@/types/order";
import {
    CheckCircle2,
    Copy,
    Check,
    Calendar,
    Package,
    ArrowUpRight,
    CreditCard,
    ShieldCheck,
} from "lucide-react";

interface UserOrderCardProps {
    order: UserOrder;
}

export function UserOrderCard({ order }: UserOrderCardProps) {
    const [copied, setCopied] = useState(false);

    const copyOrderId = () => {
        navigator.clipboard.writeText(order.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formattedDate = new Date(order.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const totalAmount = parseFloat(order.total_amount).toFixed(2);

    return (
        <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:p-6">
            {/* Header: Status, Order ID, Date */}
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Completed & Confirmed
                    </span>

                    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                        <span className="text-slate-400 font-medium">Order:</span>
                        <span className="font-mono font-semibold">{order.id.slice(0, 13)}…</span>
                        <button
                            type="button"
                            onClick={copyOrderId}
                            title="Copy full Order ID"
                            className="ml-1 text-slate-400 hover:text-slate-700 transition"
                        >
                            {copied ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formattedDate}</span>
                </div>
            </div>

            {/* Items List */}
            <div className="my-4 divide-y divide-slate-100">
                {order.items && order.items.length > 0 ? (
                    order.items.map((item) => {
                        const itemPrice = parseFloat(item.price_at_purchase).toFixed(2);
                        const itemTotal = (parseFloat(item.price_at_purchase) * item.quantity).toFixed(2);

                        return (
                            <div
                                key={item.id || item.product_id}
                                className="flex items-center justify-between py-3 first:pt-1 last:pb-1"
                            >
                                <div className="flex items-start gap-3 min-w-0 pr-4">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
                                        <Package className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-semibold text-slate-900 truncate">
                                            {item.title || "Flash Item"}
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Qty: <span className="font-semibold text-slate-700">{item.quantity}</span> × ${itemPrice}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <span className="text-sm font-bold text-slate-900">
                                        ${itemTotal}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-2 text-xs text-slate-400 italic">
                        Standard order package
                    </div>
                )}
            </div>

            {/* Footer Summary */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Paid & Inventory Deducted</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">Total Paid:</span>
                    <span className="text-base font-black text-slate-900">${totalAmount}</span>
                </div>
            </div>
        </article>
    );
}

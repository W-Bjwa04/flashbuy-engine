"use client";

import { Zap, ShoppingBag, EyeOff } from "lucide-react";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";

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
    return { isFlashActive, isFlashExpired };
}

export function ProductCard({ product }: { product: Product }) {
    const isOutOfStock = product.official_stock === 0;
    const isLowStock = !isOutOfStock && product.official_stock < 30;

    const [{ isFlashActive, isFlashExpired }, setFlashStatus] = useState(
        () => getFlashStatus(product)
    );

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

    return (
        <article className="group relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition-all duration-200 hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-950/60">

            {/* Status badge — top right */}
            <div className="absolute top-4 right-4">
                {isOutOfStock ? (
                    <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Sold out
                    </span>
                ) : isFlashActive ? (
                    <span className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 ring-1 ring-amber-500/20">
                        <Zap className="h-2.5 w-2.5 fill-current" />
                        Live
                    </span>
                ) : isFlashExpired ? (
                    <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                        Ended
                    </span>
                ) : null}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2 pr-16">
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition leading-snug">
                    {product.title}
                </h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">
                    {product.description}
                </p>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-800/60 pt-4">
                {/* Price + stock */}
                <div>
                    <span className="text-xl font-black text-zinc-100">
                        ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <div className="mt-0.5 flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${isOutOfStock ? "bg-rose-500" : isLowStock ? "bg-amber-500" : "bg-emerald-500"}`} />
                        <span className="text-[11px] text-zinc-600">
                            {isOutOfStock ? "Out of stock" : `${product.official_stock} left`}
                        </span>
                    </div>
                </div>

                {/* Action */}
                <div
                    aria-disabled="true"
                    title={isOutOfStock ? "Out of stock" : isFlashExpired ? "Sale has ended" : "Coming soon"}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold select-none transition ${
                        isDisabled
                            ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                            : "bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/20 cursor-not-allowed"
                    }`}
                >
                    {isOutOfStock ? (
                        <>
                            <EyeOff className="h-3.5 w-3.5" />
                            Unavailable
                        </>
                    ) : (
                        <>
                            <ShoppingBag className="h-3.5 w-3.5" />
                            Claim
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}

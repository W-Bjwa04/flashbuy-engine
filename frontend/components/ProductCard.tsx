import { Zap, ShoppingBag, EyeOff } from "lucide-react";
import { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
    const isOutOfStock = product.official_stock === 0;

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

    return (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl hover:shadow-zinc-950/50">

            {/* Absolute Header Status Badges */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 z-10">
                {isOutOfStock ? (
                    <span className="rounded-lg bg-zinc-950 px-2.5 py-1 text-2xl font-bold uppercase tracking-wider text-zinc-500 border border-zinc-800">
                        Sold Out
                    </span>
                ) : isFlashActive ? (
                    <span className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 text-2xl font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/5 animate-pulse">
                        <Zap className="h-3 w-3 fill-amber-400" /> Live Deal
                    </span>
                ) : isFlashExpired ? (
                    <span className="rounded-lg bg-zinc-800 px-2.5 py-1 text-2xl font-bold uppercase tracking-wider text-zinc-400 border border-zinc-700">
                        Ended
                    </span>
                ) : null}
            </div>

            {/* Product Content Details Container */}
            <div className="space-y-3">
                <div className="space-y-1.5">
                    <h3 className="pr-20 text-lg font-bold tracking-tight text-zinc-100 transition group-hover:text-white">
                        {product.title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">
                        {product.description}
                    </p>
                </div>

                {/* Live Stock Tracking Status pill */}
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-2.5 py-1 text-xs text-zinc-400 border border-zinc-800/60">
                    <span className={`h-1.5 w-1.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : product.official_stock < 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span>{isOutOfStock ? "No Stock Available" : `${product.official_stock} Items Remaining`}</span>
                </div>
            </div>

            {/* Pricing and Action Button Footer Block */}
            <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-zinc-800/60">
                <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Price</span>
                    <span className="text-2xl font-black text-zinc-100">\${parseFloat(product.price).toFixed(2)}</span>
                </div>

                <button
                    disabled={isOutOfStock || isFlashExpired}
                    className={`flex h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 outline-none w-1/2
            ${isOutOfStock || isFlashExpired
                            ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                            : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-600/30 active:scale-95"
                        }`}
                >
                    {isOutOfStock ? (
                        <>
                            <EyeOff className="h-4 w-4" />
                            <span>Unavailable</span>
                        </>
                    ) : (
                        <>
                            <ShoppingBag className="h-4 w-4" />
                            <span>Claim Deal</span>
                        </>
                    )}
                </button>
            </div>

        </div>
    );
}

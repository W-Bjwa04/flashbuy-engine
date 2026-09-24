import { authenticatedFetch } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { ProductsResponse } from "@/types/product";
import { AlertCircle, Flame, PackageSearch, Zap } from "lucide-react";

export default async function FlashSalesPage() {
    try {
        const res = await authenticatedFetch("/api/products?flashSaleOnly=true");

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const json: ProductsResponse = await res.json();
        const products = json.data?.products ?? [];

        const liveCount = products.filter(
            (p) =>
                p.is_flash_sale &&
                p.flash_start_at &&
                p.flash_end_at &&
                new Date() >= new Date(p.flash_start_at) &&
                new Date() <= new Date(p.flash_end_at)
        ).length;

        if (products.length === 0) {
            return (
                <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                            <Flame className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800">No active flash sales right now</h2>
                            <p className="mt-1 text-xs text-slate-400">
                                Flash events launch regularly. Check back shortly for lightning discounts.
                            </p>
                        </div>
                    </div>
                </main>
            );
        }

        return (
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                                <Flame className="h-3.5 w-3.5 fill-current animate-pulse text-amber-600" />
                                Lightning Deals
                            </span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">
                            Flash Sales
                        </h1>
                        <p className="text-xs text-slate-500">
                            High-velocity deals secured via atomic Redis Lua gates and BullMQ workers.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                            {liveCount} Live {liveCount === 1 ? "Deal" : "Deals"} Active
                        </span>
                    </div>
                </div>

                {/* Grid */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((item) => (
                        <ProductCard key={item.id} product={item} />
                    ))}
                </div>
            </main>
        );
    } catch (error) {
        console.error("[FlashSalesPage fetch error]:", error);
        return (
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    <div>
                        <p className="font-semibold text-red-700">Failed to load flash sale products</p>
                        <p className="mt-0.5 text-xs text-slate-500">Make sure the backend is running and you are signed in.</p>
                    </div>
                </div>
            </main>
        );
    }
}

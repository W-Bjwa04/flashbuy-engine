import { authenticatedFetch } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { ProductsResponse } from "@/types/product";
import { AlertCircle, PackageSearch } from "lucide-react";

export default async function HomePage() {
    try {
        const res = await authenticatedFetch("/api/products");

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const json: ProductsResponse = await res.json();
        const products = json.data?.products ?? [];

        const flashActive = products.filter(
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
                        <PackageSearch className="h-10 w-10 text-slate-300" />
                        <div>
                            <h2 className="text-base font-semibold text-slate-700">No products yet</h2>
                            <p className="mt-1 text-sm text-slate-400">Check back soon — deals are added regularly.</p>
                        </div>
                    </div>
                </main>
            );
        }

        return (
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Page header */}
                <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">
                            Marketplace
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {products.length} product{products.length !== 1 ? "s" : ""}
                            {flashActive > 0 && (
                                <> · <span className="font-medium text-amber-600">{flashActive} live deal{flashActive !== 1 ? "s" : ""}</span></>
                            )}
                        </p>
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
        console.error("[HomePage fetch error]:", error);
        return (
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    <div>
                        <p className="font-semibold text-red-700">Failed to load products</p>
                        <p className="mt-0.5 text-slate-500">Make sure the backend is running and you are signed in.</p>
                    </div>
                </div>
            </main>
        );
    }
}

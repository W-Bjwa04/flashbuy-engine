import { authenticatedFetch } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { ProductsResponse } from "@/types/product";
import { AlertCircle, Layers } from "lucide-react";

export default async function HomePage() {
  try {
    // 1. Call your Express backend through your authenticated helper tool
    const res = await authenticatedFetch("/api/products");

    if (!res.ok) {
      throw new Error(`Server returned error status code: ${res.status}`);
    }

    const json: ProductsResponse = await res.json();
    const products = json.data?.products || [];

    if (products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
          <Layers className="h-8 w-8 text-zinc-600" />
          <h2 className="mt-4 text-base font-semibold text-zinc-200">No products available</h2>
          <p className="mt-1 text-sm text-zinc-500">Check back later for newly added flash catalog sales.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 sm:text-3xl">
            Live Product Marketplace
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Real-time stock quantities and timed promotional pricing.
          </p>
        </div>

        {/* 2. Map items into a beautiful scannable layout grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    );

  } catch (error) {
    console.error("[Dashboard Fetch Execution Error]:", error);
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-400">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div>
          <h4 className="font-semibold text-rose-300">Failed to render products dashboard</h4>
          <p className="mt-0.5 text-zinc-400">Please verify your local backend connection sync status or try logging back in.</p>
        </div>
      </div>
    );
  }
}

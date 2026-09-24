"use server";

import { authenticatedFetch } from "@/lib/api";

export interface PlaceOrderResult {
    success: boolean;
    trackingId?: string;
    isFlashSale?: boolean;
    error?: string;
}

/**
 * Places an order via POST /api/orders.
 * Returns the trackingId from the 202 Accepted response so the
 * client can subscribe to websocket updates keyed by that ID.
 */
export async function placeOrderAction(
    productId: string,
    quantity: number,
    totalAmount: number
): Promise<PlaceOrderResult> {
    try {
        const res = await authenticatedFetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity, totalAmount }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            // Parse Zod validation errors if present
            const raw: string = data.message ?? "Order failed. Please try again.";
            const msg = raw.startsWith("Validation error:")
                ? raw.replace("Validation error:", "").split(",")[0].split(": ").slice(1).join(": ").trim()
                : raw;
            return { success: false, error: msg };
        }

        return {
            success: true,
            trackingId: data.data.trackingId,
            isFlashSale: data.data.isFlashSale,
        };
    } catch (err) {
        console.error("[placeOrderAction]", err);
        return { success: false, error: "Network error — could not reach backend." };
    }
}

/**
 * Fetches completed orders for the authenticated user from GET /api/orders
 */
export async function getMyOrdersAction(status: string = "COMPLETED") {
    try {
        const res = await authenticatedFetch(`/api/orders?status=${encodeURIComponent(status)}`, {
            method: "GET",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            return { success: false, error: data.message ?? "Failed to fetch orders" };
        }

        return {
            success: true,
            data: data.data,
        };
    } catch (err) {
        console.error("[getMyOrdersAction]", err);
        return { success: false, error: "Network error — could not reach backend." };
    }
}

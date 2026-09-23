import { createClient } from "redis";
import { Server as SocketIOServer } from "socket.io";
import { env } from "../config/env";
import logger from "../lib/logger";

export const ORDER_NOTIFICATIONS_CHANNEL = "order_notifications";

export interface OrderNotificationPayload {
    trackingId: string;
    orderId?: string | null;
    userId: string;
    productId: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    reason?: string;
    timestamp: string;
}

const subscriberClient = createClient({
    url: env.REDIS_URL || "redis://127.0.0.1:6379",
});

subscriberClient.on("error", (error) => {
    logger.error({ err: error }, "[WS Redis Subscriber] Redis Client Error");
});

export async function startOrderNotificationSubscriber(io: SocketIOServer): Promise<void> {
    try {
        if (!subscriberClient.isOpen) {
            await subscriberClient.connect();
        }

        await subscriberClient.subscribe(ORDER_NOTIFICATIONS_CHANNEL, (message: string) => {
            try {
                const payload = JSON.parse(message) as OrderNotificationPayload;
                const targetRoom = `user:${payload.userId}`;

                logger.info(
                    `[WS Gateway] Captured ${payload.status} for tracking ${payload.trackingId}. Routing to room "${targetRoom}"`
                );

                // Targeted emit to the specific user's active sockets (multi-tab safe)
                io.to(targetRoom).emit("order_status_update", payload);
            } catch (err) {
                logger.error({ err, rawMessage: message }, "[WS Gateway] Failed to parse Redis message");
            }
        });

        logger.info(`[WS Gateway] Subscribed to Redis channel: "${ORDER_NOTIFICATIONS_CHANNEL}"`);
    } catch (error: any) {
        logger.error({ err: error }, "[WS Gateway] Error initiating order notification subscriber");
        throw error;
    }
}

export async function stopOrderNotificationSubscriber(): Promise<void> {
    if (subscriberClient.isOpen) {
        logger.info("[WS Gateway] Disconnecting Redis subscriber...");
        await subscriberClient.unsubscribe(ORDER_NOTIFICATIONS_CHANNEL);
        await subscriberClient.quit();
        logger.info("[WS Gateway] Redis subscriber cleanly disconnected.");
    }
}
import { createClient } from 'redis';
import { env } from '../config/env';
import logger from '../lib/logger';
import { ORDER_NOTIFICATIONS_CHANNEL } from '../constants/constant';

// Type contract matching the worker's published payload
export interface OrderNotificationMessage {
    trackingId: string;
    orderId?: string;
    userId: string;
    productId: string;
    status: 'COMPLETED' | 'FAILED';
    reason?: string;
    timestamp: string;
}



async function runSubscriber(): Promise<void> {
    // Subscribers require a dedicated Redis client instance
    const subscriber = createClient({
        url: env.REDIS_URL || 'redis://127.0.0.1:6379',
    });

    subscriber.on('error', (err) => {
        logger.error({ err }, 'Redis Subscriber Client Error');
    });

    subscriber.on('reconnecting', () => {
        logger.warn('Redis Subscriber attempting reconnection...');
    });

    await subscriber.connect();
    logger.info('Connected to Redis as standalone Pub/Sub Subscriber.');

    // Listen to order events published by the BullMQ worker
    await subscriber.subscribe(ORDER_NOTIFICATIONS_CHANNEL, (rawMessage: string) => {

        try {
            const payload = JSON.parse(rawMessage) as OrderNotificationMessage;

            console.dir(
                {
                    trackingId: payload.trackingId,
                    orderId: payload.orderId ?? 'N/A',
                    userId: payload.userId,
                    productId: payload.productId,
                    status: payload.status,
                    reason: payload.reason ?? 'N/A',
                    timestamp: payload.timestamp,
                },
                { depth: null, colors: true }
            );
        } catch {
            logger.warn({ rawMessage }, 'Received non-JSON string message on channel');
        }
    });

    logger.info(`Actively listening for order events on channel "${ORDER_NOTIFICATIONS_CHANNEL}"...`);

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
        logger.info(`Received ${signal}. Unsubscribing and terminating subscriber client...`);
        try {
            await subscriber.unsubscribe(ORDER_NOTIFICATIONS_CHANNEL);
            await subscriber.disconnect();
            logger.info('Redis subscriber cleanly disconnected.');
            process.exit(0);
        } catch (err) {
            logger.error({ err }, 'Error during subscriber disconnect');
            process.exit(1);
        }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

runSubscriber().catch((err) => {
    logger.error({ err }, 'Fatal failure in Redis subscriber runner');
    process.exit(1);
});
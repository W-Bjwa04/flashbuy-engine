import crypto from 'crypto';
import { AppError } from '../errors/AppError';
import { generateProductMetadataRedisKey, generateProductStockRedisKey } from '../lib/redisKey';
import { client as redis } from '../redis/client';
import logger from '../lib/logger';
import { getProductByIdRepository } from '../repositories/product.repository';
import { LUA_SCRIPTS } from '../constants/luaScripts';
import { orderQueue } from '../queues/order.queue';

export interface ReservationResult {
    trackingId: string;
    isFlashSale: boolean;
    remainingStock?: number;
}

export async function createOrderService(
    productId: string,
    quantity: number,
    userId: string,
    totalAmount: number
): Promise<ReservationResult> {
    const trackingId = crypto.randomUUID();
    const metaKey = generateProductMetadataRedisKey(productId);

    // 1. Check Redis cache for product metadata
    let productMeta = await redis.hGetAll(metaKey);
    let isFlashSale = false;
    let dbStock = 0;

    // 2. Cache Miss: Fetch product from PostgreSQL and populate cache if flash sale
    if (!productMeta || Object.keys(productMeta).length === 0) {
        logger.warn(`Cache miss for product metadata: ${productId}. Fetching from PostgreSQL.`);

        const product = await getProductByIdRepository(productId);
        if (!product) {
            throw new AppError(404, 'Product not found.');
        }

        isFlashSale = product.is_flash_sale;
        dbStock = product.official_stock;

        if (isFlashSale) {
            logger.info(`Detected active Flash Sale product ${productId}. Synchronizing Redis cache.`);

            await redis.hSet(metaKey, {
                is_flash_sale: 'true',
                official_stock: String(dbStock),
            });
            await redis.expire(metaKey, 86400);

            const stockKey = generateProductStockRedisKey(productId);
            await redis.set(stockKey, String(dbStock));
        }
    } else {
        // Cache Hit
        isFlashSale = productMeta.is_flash_sale === 'true';
        dbStock = parseInt(productMeta.official_stock, 10);
    }

    let remainingStock: number | undefined;

    // 3. Concurrency Path Allocation
    if (isFlashSale) {
        // High-Concurrency Path: Redis Lua Gatekeeper
        const stockKey = generateProductStockRedisKey(productId);

        const result = (await redis.eval(LUA_SCRIPTS.decrementStock, {
            keys: [stockKey],
            arguments: [quantity.toString()],
        })) as number;

        if (result === -1) {
            throw new AppError(422, 'Flash sale item is sold out or requested quantity exceeds available stock.');
        }

        remainingStock = result;
        logger.info(`[Flash Stock Reserved] User ${userId} secured ${quantity} units via Redis. Remaining: ${remainingStock}`);
    } else {
        // Standard Path: Verify availability before queue dispatch
        if (dbStock < quantity) {
            throw new AppError(422, `Insufficient stock for product. Available: ${dbStock}`);
        }
        logger.info(`[Standard Order Accepted] User ${userId} requested standard product ${productId}.`);
    }

    // 4. Decoupled Asynchronous Persistence via BullMQ (Always reached by both paths)
    await orderQueue.add(
        'process-order',
        {
            trackingId,
            userId,
            productId,
            quantity,
            totalAmount,
            isFlashSale,
        },
        {
            jobId: trackingId, // Idempotency key
        }
    );

    // Inside src/services/order.service.ts, right after orderQueue.add(...)
    await redis.publish(
        'order_notifications',
        JSON.stringify({
            trackingId,
            orderId: null,
            userId,
            productId,
            status: 'PENDING',
            timestamp: new Date().toISOString(),
        })
    );

    logger.info(`[Queue Dispatched] Job ${trackingId} added to ${orderQueue.name}`);

    return {
        trackingId,
        isFlashSale,
        remainingStock,
    };
}
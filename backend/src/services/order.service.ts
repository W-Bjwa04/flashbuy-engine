import crypto from 'crypto';
import { pool } from '../lib/db';
import { AppError } from '../errors/AppError';
import { generateProductMetadataRedisKey, generateProductStockRedisKey } from '../lib/redisKey';
import { client as redis } from '../redis/client';
import logger from '../lib/logger';
import { getProductByIdRepository } from '../repositories/product.repository';
import { LUA_SCRIPTS } from '../constants/luaScripts';



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

    // 1. Check Redis memory first
    let productMeta = await redis.hGetAll(metaKey);
    let isFlashSale = false;
    let dbStock = 0;

    // 2. Cache Miss: Product meta is not in Redis
    if (!productMeta || Object.keys(productMeta).length === 0) {
        logger.warn(`Cache miss for product metadata: ${productId}. Fetching from PostgreSQL.`);

        const product = await getProductByIdRepository(productId);
        if (!product) {
            throw new AppError(404, 'Product not found.');
        }

        isFlashSale = product.is_flash_sale;
        dbStock = product.official_stock;

        // CRITICAL CHANGE: Only write to Redis if the admin has turned it into a Flash Sale item
        if (isFlashSale) {
            logger.info(`Detected new dynamic Flash Sale product ${productId}. Saving to Redis gateway.`);

            await redis.hSet(metaKey, {
                is_flash_sale: 'true',
                official_stock: String(dbStock)
            });
            await redis.expire(metaKey, 86400);

            // Explicitly prepare the inventory token key as well
            const stockKey = generateProductStockRedisKey(productId);
            await redis.set(stockKey, String(dbStock));
        }
    } else {
        // Cache Hit: Product was already confirmed as a flash sale item in Redis
        isFlashSale = productMeta.is_flash_sale === 'true';
        dbStock = parseInt(productMeta.official_stock, 10);
    }

    // 3. High-Concurrency Path (Redis Lua Engine)
    if (isFlashSale) {
        const stockKey = generateProductStockRedisKey(productId);

        let result = (await redis.eval(LUA_SCRIPTS.decrementStock, {
            keys: [stockKey],
            arguments: [quantity.toString()]
        })) as number;

        if (result === -1) {
            throw new AppError(422, 'Flash sale item is sold out or requested quantity exceeds stock.');
        }

        logger.info(`[Flash Stock Reserved] User ${userId} secured ${quantity} units via Redis.`);
        return { trackingId, isFlashSale: true, remainingStock: result };
    }

    // 4. Standard Path (Database Only fallback)
    if (dbStock < quantity) {
        throw new AppError(422, `Insufficient stock for product. Available: ${dbStock}`);
    }

    logger.info(`[Standard Order Accepted] User ${userId} requested standard product ${productId}.`);
    return { trackingId, isFlashSale: false };
}


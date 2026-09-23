// src/tasks/inventorySyncRedis.ts
import { pool } from '../lib/db';
import { client as redis } from '../redis/client';
import logger from '../lib/logger';

export async function syncFlashSaleInventoryToCache(): Promise<void> {
    logger.info('Starting Redis inventory and metadata cache warmup...');

    // Fetch all active products to build our lightning-fast Redis gateway
    const query = `SELECT id, official_stock, is_flash_sale FROM products;`;

    try {
        const { rows } = await pool.query(query);
        if (rows.length === 0) return;

        const pipeline = redis.multi();

        for (const product of rows) {
            const metaKey = `product:${product.id}:meta`;

            // 1. Cache product metadata (so Redis knows if it's flash sale or not)
            pipeline.hSet(metaKey, {
                is_flash_sale: String(product.is_flash_sale),
                official_stock: String(product.official_stock)
            });
            // Set 1-day expiration to prevent stale data over time
            pipeline.expire(metaKey, 86400);

            // 2. If it's a flash sale item, also cache its high-concurrency stock tracking key
            if (product.is_flash_sale) {
                const stockKey = `product:${product.id}:stock`;
                pipeline.set(stockKey, String(product.official_stock));
            }
        }

        await pipeline.exec();
        logger.info(`Successfully synchronized cache gateway for ${rows.length} products.`);
    } catch (err) {
        logger.error({ err }, 'Failed to warm up cache gateway.');
    }
}

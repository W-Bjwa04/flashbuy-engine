// src/workers/order.worker.ts
import { Worker, Job } from 'bullmq';
import { pool } from '../lib/db';
import { client as redis, redisOptions, connectRedis } from '../redis/client'; // Added connectRedis
import { OrderJobPayload } from '../queues/order.queue';
import { generateProductStockRedisKey } from '../lib/redisKey';
import logger from '../lib/logger';
import { ORDER_QUEUE_NAME } from '../constants/constant';
import { AppError } from '../errors/AppError';

// FIX 1: Ensure the master Node-Redis client instance is connected for this independent process
(async () => {
    try {
        await connectRedis();
        logger.info("[Worker Redis Link] Master Redis command client successfully online.");
    } catch (err) {
        logger.error({ err }, "[Worker Redis Link] Critical connection failure.");
    }
})();

export const orderWorker = new Worker<OrderJobPayload>(
    ORDER_QUEUE_NAME,
    async (job: Job<OrderJobPayload>) => {
        if (job.name !== 'process-order') return;

        const { trackingId, userId, productId, quantity, totalAmount, isFlashSale } = job.data;
        logger.info(`[Worker Processing] Starting job ${job.id} for user ${userId}`);

        const dbClient = await pool.connect();

        try {
            await dbClient.query('BEGIN');

            // 1. Path Separation: Only run row locks for standard orders
            if (!isFlashSale) {
                const productRes = await dbClient.query(
                    `SELECT official_stock FROM products WHERE id = $1 FOR UPDATE`,
                    [productId]
                );

                if (productRes.rows.length === 0) {
                    throw new AppError(404, `Product ${productId} not found in database.`);
                }

                const currentDbStock = productRes.rows[0].official_stock;
                if (currentDbStock < quantity) {
                    throw new AppError(400, `Insufficient database stock.`);
                }
            }

            // 2. Decrement core storage row
            await dbClient.query(
                `UPDATE products 
                 SET official_stock = official_stock - $1, updated_at = NOW() 
                 WHERE id = $2`,
                [quantity, productId]
            );

            // 3. Document master billing summary
            const orderRes = await dbClient.query(
                `INSERT INTO orders (user_id, total_amount, status) 
                VALUES ($1, $2, 'PROCESSING') 
                RETURNING id`,
                [userId, totalAmount]
            );

            const orderId = orderRes.rows[0].id;

            // 4. Attach purchase item detail mapping breakdown (Idempotency handling)
            await dbClient.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) 
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT DO NOTHING`,
                [orderId, productId, quantity, totalAmount / quantity]
            );

            // 5. Run mock 3rd party processing gateway delay
            await new Promise((resolve) => setTimeout(resolve, 5000));
            const mockTxnRef = `txn_${trackingId.replace(/-/g, '').slice(0, 16)}`;

            // 6. FIX 2: Added ON CONFLICT DO NOTHING to prevent database retry crashes
            await dbClient.query(
                `INSERT INTO payments (order_id, transaction_reference, amount, status) 
                 VALUES ($1, $2, $3, 'PAID')
                 ON CONFLICT (transaction_reference) DO NOTHING`,
                [orderId, mockTxnRef, totalAmount]
            );

            // 7. Commit state status update modifications
            await dbClient.query(
                `UPDATE orders SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1`,
                [orderId]
            );

            await dbClient.query('COMMIT');
            logger.info(`[Worker Success] Order ${orderId} completed for tracking ID ${trackingId}`);



            // 8. Publish Success Event to Redis Pub/Sub
            const successPayload = JSON.stringify({
                trackingId, orderId, userId, productId, status: 'COMPLETED', timestamp: new Date().toISOString(),
            });

            await redis.publish('order_notifications', successPayload);
            logger.info(`[Pub/Sub Publisher] Emitted COMPLETED event for user ${userId} to channel: order_notifications`);

            return { orderId, status: 'COMPLETED' };

        } catch (err: any) {
            await dbClient.query('ROLLBACK');
            logger.error({ err, trackingId }, `[Worker Failed] Transaction rolled back for job ${job.id}`);

            if (isFlashSale) {
                const stockKey = generateProductStockRedisKey(productId);
                // This command will now execute flawlessly because the master client is connected!
                await redis.incrBy(stockKey, quantity);
                logger.warn(`[Compensating Action] Refunded ${quantity} units back to Redis key ${stockKey}`);
            }

            // Publish Failure Event to Redis Pub/Sub
            const failurePayload = JSON.stringify({
                trackingId, userId, productId, status: 'FAILED', reason: err.message || 'Order processing failed', timestamp: new Date().toISOString(),
            });
            await redis.publish('order_notifications', failurePayload);
            logger.warn(`[Pub/Sub Publisher] Emitted FAILED event for trackingId ${trackingId} to channel: order_notifications`);

            throw err;
        } finally {
            dbClient.release();
            logger.info(`[Worker Completed] Released database client connection for job ${job.id}`);
        }
    },
    {
        connection: redisOptions,
        concurrency: 1,
    }
);

orderWorker.on('completed', (job) => {
    logger.info(`[Worker] Job ${job.id} marked as completed.`);
});

orderWorker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id }, `[Worker] Job failed all execution attempts.`);
});

logger.info(`[Worker Engine] Order background worker initialized successfully and listening for jobs...`);

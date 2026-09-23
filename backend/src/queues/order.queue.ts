import { Queue } from 'bullmq';
import { redisOptions } from '../redis/client';
import { ORDER_QUEUE_NAME } from '../constants/constant';
import logger from '../lib/logger';

export interface OrderJobPayload {
    trackingId: string;
    userId: string;
    productId: string;
    quantity: number;
    totalAmount: number;
    isFlashSale: boolean;
}

export const orderQueue = new Queue<OrderJobPayload>(ORDER_QUEUE_NAME, {
    connection: redisOptions,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

orderQueue.on('error', (err) => {
    logger.error({ err }, 'BullMQ Queue client connection error');
});
import { createClient } from "redis";
import logger from "../lib/logger";
import { env } from "../config/env";

export const client = createClient({
    url: env.REDIS_URL
});

client.on("error", (err) => {
    logger.error({ err, stack: err.stack }, `Redis Client Error: ${err.message || err}`);
});

client.on("connect", () => {
    logger.info("Redis client connecting...");
});

client.on("ready", () => {
    logger.info("Redis client connected and ready to use!");
});

export async function connectRedis() {
    if (!client.isOpen) {
        await client.connect();
    }
}

export async function disconnectRedis() {
    if (client.isOpen) {
        await client.disconnect();
    }
}
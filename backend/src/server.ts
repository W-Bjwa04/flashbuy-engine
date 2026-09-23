import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import logger from "./lib/logger";
import { pool } from "./lib/db";
import { connectRedis, disconnectRedis, client } from "./redis/client";
import { syncFlashSaleInventoryToCache } from "./tasks/inventorySyncRedis";

const app = createApp();
const httpServer = createServer(app);

/*

 * Initializes infrastructure dependencies and boots up the network listener.

*/

async function bootstrap() {
    let runningServer: any;

    try {
        // Ensure the relational database is accessible before initializing other tasks
        await pool.query('SELECT NOW()');
        logger.info('Successfully connected to the PostgreSQL database pool');

        // Initialize the key-value database connection
        await connectRedis();

        if (!client.isOpen) {
            logger.error('Failed to connect to Redis');
            process.exit(1);
        }

        // Synchronize and warm up inventories in memory once storage engines are ready
        await syncFlashSaleInventoryToCache().catch((error: any) => {
            logger.error({ err: error, stack: error.stack }, `Failed to warm up Redis cache: ${error.message || error}`);
        });

        // Open the HTTP socket to start routing inbound network payloads
        runningServer = httpServer.listen(env.PORT, () => {
            logger.info(`Server running dynamically on http://localhost:${env.PORT}`);
        });

    } catch (error: any) {
        logger.error({ err: error, stack: error.stack }, `Failed to start server: ${error.message || error}`);
        process.exit(1);
    }

    /*

     * Intercepts process termination requests to close resources cleanly without data loss.

    */

    const handleShutdown = async (signal: string) => {
        logger.info(`Received ${signal}. Starting graceful shutdown...`);

        if (runningServer) {
            // Stop receiving incoming connection sockets while processing existing requests
            runningServer.close(async () => {
                logger.info("Integrated HTTP network server closed.");

                try {
                    // Release socket allocations to prevent connection leakage on the cluster
                    logger.info("Closing database and Redis connection clients...");
                    await pool.end();
                    await disconnectRedis();

                    logger.info("Graceful shutdown complete. Exiting process cleanly.");
                    process.exit(0);
                } catch (error: any) {
                    logger.error({ err: error, stack: error.stack }, `Error during clients disconnection: ${error.message || error}`);
                    process.exit(1);
                }
            });
        } else {
            process.exit(0);
        }
    };

    // Listen for termination signals issued by systems like Docker, Kubernetes, or the CLI
    process.on("SIGINT", () => handleShutdown("SIGINT"));
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
}

bootstrap();

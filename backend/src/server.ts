import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import logger from "./lib/logger";
import { pool } from "./lib/db";


const app = createApp();

// Wrap your Express instance into a Node HTTP Server
const httpServer = createServer(app);


async function bootstrap() {



    let runningServer: any;

    try {

        // Test the database connection 
        pool.query('SELECT NOW()')
            .then(() => logger.info('Successfully connected to the PostgreSQL database pool'))
            .catch((err) => {
                logger.error({ err }, 'Failed to connect to the PostgreSQL database pool');
                process.exit(1); // Stop the server if the database isn't accessible
            });

        runningServer = httpServer.listen(env.PORT, () => {
            logger.info(`Server running dynamically on http://localhost:${env.PORT}`);
        });

    } catch (error: any) {
        logger.error({ err: error, stack: error.stack }, `Failed to start server: ${error.message || error}`);
        process.exit(1);
    }

    // Graceful Shutdown Handler Function
    const handleShutdown = async (signal: string) => {
        logger.info(`Received ${signal}. Starting graceful shutdown...`);

        // Stop accepting new network payloads or streams
        if (runningServer) {
            runningServer.close(() => {
                logger.info("Integrated HTTP & WebSocket network servers closed.");
            });
        }

        try {
            logger.info("Graceful shutdown complete. Exiting process.");
            process.exit(0);
        } catch (error: any) {
            logger.error({ err: error, stack: error.stack }, `Error during graceful shutdown: ${error.message || error}`);
            process.exit(1);
        }
    };

    // Register listeners for application termination signals
    process.on("SIGINT", () => handleShutdown("SIGINT"));
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
}


bootstrap();
import express, { Request, Response } from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./config/env";
import logger from "./lib/logger";
import { AuthJwtPayload } from "./types/auth.types";
import {
    startOrderNotificationSubscriber,
    stopOrderNotificationSubscriber,
} from "./subscribers/orderNotification.subscriber";

const app = express();
app.use(express.json());

const httpServer = http.createServer(app);

// 1. Dedicated Socket.IO Instance
export const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "*", // Adjust to your Next.js frontend origin in production
        methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
});

// 2. Health & Metrics Check
app.get("/health", (_req: Request, res: Response) => {
    res.json({
        service: "flashbuy-websocket-gateway",
        status: "ok",
        connectedClients: io.engine.clientsCount,
        uptime: process.uptime(),
    });
});

app.get("/ready", (_req: Request, res: Response) => {
    res.json({ ready: true, connectedClients: io.engine.clientsCount });
});

// 3. JWT Handshake Authentication Middleware
io.use((socket: Socket, next) => {
    const rawToken =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization;

    if (!rawToken) {
        return next(new Error("Unauthorized: Bearer token required for WebSocket connection"));
    }

    const token = rawToken.replace(/^Bearer\s+/i, "");

    try {
        const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AuthJwtPayload;
        (socket as any).user = decoded;
        next();
    } catch {
        return next(new Error("Unauthorized: Invalid or expired token"));
    }
});

// 4. Socket Lifecycle & Room Allocation
io.on("connection", (socket: Socket) => {
    const user = (socket as any).user as AuthJwtPayload;
    const userRoom = `user:${user.userId}`;

    socket.join(userRoom);
    logger.info(
        `[Client Connected] User: ${user.userId} | Socket ID: ${socket.id} | Room: ${userRoom} | Total: ${io.engine.clientsCount}`
    );

    socket.on("disconnect", (reason) => {
        logger.info(`[Client Disconnected] User: ${user.userId} | Socket ID: ${socket.id} | Reason: ${reason}`);
    });
});

// 5. Bootstrap Server
async function bootstrapWebSocketServer() {
    try {
        await startOrderNotificationSubscriber(io);

        const PORT = process.env.WS_PORT || 4001;
        httpServer.listen(PORT, () => {
            logger.info(`⚡ FlashBuy Dedicated WebSocket Gateway running on http://localhost:${PORT}`);
        });
    } catch (error: any) {
        logger.error({ err: error }, `Failed to start WebSocket service: ${error.message || error}`);
        process.exit(1);
    }
}

// 6. Graceful Shutdown
const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down WebSocket service...`);

    io.disconnectSockets(true);

    try {
        await stopOrderNotificationSubscriber();
    } catch (err) {
        logger.error({ err }, "Error stopping Redis notification subscriber");
    }

    httpServer.close(() => {
        logger.info("WebSocket HTTP server closed successfully.");
        process.exit(0);
    });
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

process.on("uncaughtException", (error: Error) => {
    logger.error({ err: error, stack: error.stack }, `CRITICAL WS: Uncaught Exception! ${error.message}`);
    process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error({ err: error, stack: error.stack }, `CRITICAL WS: Unhandled Promise Rejection! ${error.message}`);
    process.exit(1);
});

bootstrapWebSocketServer();
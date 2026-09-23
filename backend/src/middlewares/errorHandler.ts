import { NextFunction, Request, Response } from "express";
import logger from "../lib/logger";
import { AppError } from "../errors/AppError";

export function errorHandlder(
    error: any, // Changed to 'any' or 'Error & { code?: string }' to safely read Postgres error codes
    _req: Request,
    res: Response,
    _next: NextFunction
): void {

    // 1. Handle your custom operational errors
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
        return;
    }

    // 2. Handle Postgres Invalid UUID Format Error (Code: 22P02)
    if (error.code === "22P02") {
        res.status(400).json({
            success: false,
            message: "Invalid ID format. Please ensure your identifier is a valid UUID."
        });
        return;
    }

    // 3. Handle Postgres Unique Constraint Violations (Code: 23505)
    if (error.code === "23505") {
        res.status(409).json({
            success: false,
            message: "A record with this unique identifier already exists."
        });
        return;
    }

    // 4. Default tracking for genuine engineering/system faults
    logger.error(error, "Unhandled error occurred");
    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
    return;
}

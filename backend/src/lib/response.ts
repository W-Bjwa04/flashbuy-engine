import { Response } from "express";

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

export function sendResponse<T>(res: Response, statusCode: number, message: string, data?: T): Response {
    const payload: ApiResponse<T> = {
        success: statusCode >= 200 && statusCode < 300,
        message,
    };

    if (data !== undefined) {
        payload.data = data;
    }

    return res.status(statusCode).json(payload);
}

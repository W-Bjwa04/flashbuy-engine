import { Request, Response } from "express";
import { sendResponse } from "../lib/response";

export const handleGetHealthCheck = async (_req: Request, res: Response): Promise<void> => {
    sendResponse(res, 200, "API is live");
};



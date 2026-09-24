import { Request, Response } from "express";
import { createOrderSchema } from "../validations/order.validation";
import { AppError } from "../errors/AppError";
import { sendResponse } from "../lib/response";
import { createOrderService, getUserOrdersService } from "../services/order.service";


/**
 * Handles incoming order creation requests and validates memory parameters.
 */
export async function createOrderController(req: Request, res: Response): Promise<void> {
    // Validate request structure via Zod schema
    const validate = createOrderSchema.safeParse(req);

    if (!validate.success) {
        const errorMessage = validate.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");
        throw new AppError(400, `Validation error: ${errorMessage}`);
    }

    // Destructure payload properties from parsed Zod block
    const { productId, quantity, totalAmount } = validate.data.body;

    // Extract authorization reference safely from the request context
    const userId = (req as any).user?.userId;
    if (!userId) {
        throw new AppError(401, "Unauthorized: Identity context missing from request profile.");
    }

    // Delegate business state execution to service layer
    const result = await createOrderService(productId, quantity, userId, totalAmount);

    // Issue 202 Accepted response status for background asynchronous processing jobs
    sendResponse(res, 202, "Stock secured. Order accepted for background processing.", result);
}

/**
 * Handles fetching completed orders for the authenticated user.
 */
export async function getUserOrdersController(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.userId;
    if (!userId) {
        throw new AppError(401, "Unauthorized: Identity context missing from request profile.");
    }

    const ALLOWED_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"] as const;
    const rawStatus = req.query.status;

    let status = "COMPLETED";
    if (rawStatus !== undefined) {
        if (typeof rawStatus !== "string" || !ALLOWED_STATUSES.includes(rawStatus as any)) {
            throw new AppError(400, "Invalid status parameter. Allowed values: PENDING, PROCESSING, COMPLETED, FAILED");
        }
        status = rawStatus;
    }

    const orders = await getUserOrdersService(userId, status);
    sendResponse(res, 200, "User orders retrieved successfully", orders);
}


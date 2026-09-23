import { Request, Response, NextFunction } from "express";
import { createOrderSchema } from "../validations/order.validation";
import { AppError } from "../errors/AppError";
import { sendResponse } from "../lib/response";
import { createOrderService } from "../services/order.service";


/**
 * Handles incoming order creation requests and validates memory parameters.
 */
export async function createOrderController(req: Request, res: Response, next: NextFunction): Promise<void> {
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

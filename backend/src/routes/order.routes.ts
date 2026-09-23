import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { catchAsync } from "../middlewares/catchAsync";
import { createOrderController } from "../controllers/order.controller";

export const orderRouter = Router();

// Apply global authentication across all order sub-paths
orderRouter.use(authenticate);

// Route declaration for flash sale execution processing
orderRouter.post("/", catchAsync(createOrderController));

export default orderRouter;

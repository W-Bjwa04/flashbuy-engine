import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { catchAsync } from "../middlewares/catchAsync";
import { createOrderController, getUserOrdersController } from "../controllers/order.controller";
import { orderSlidingWindowRateLimiter } from "../middlewares/orderRateLimiter.middleware";

export const orderRouter = Router();

// Apply global authentication across all order sub-paths
orderRouter.use(authenticate);

// Fetch authenticated user's completed orders
orderRouter.get("/", catchAsync(getUserOrdersController));

// Route declaration for flash sale execution processing
// Chain: JWT auth → sliding-window rate limiter (3 req/min) → controller
orderRouter.post(
  "/",
  catchAsync(orderSlidingWindowRateLimiter),
  catchAsync(createOrderController)
);

export default orderRouter;

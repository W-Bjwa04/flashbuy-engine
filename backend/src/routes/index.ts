import { Router } from "express";
import { healthRouter } from "./health.routes";
import { authRouter } from "./auth.routes";
import { productRouter } from "./product.routes";
import { orderRouter } from "./order.routes";

function apiRouter() {
    const router = Router();
    router.use("/health", healthRouter);
    router.use("/auth", authRouter)
    router.use("/products", productRouter)
    router.use("/orders", orderRouter)
    return router;
}

export { apiRouter };
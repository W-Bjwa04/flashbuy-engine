import { Router } from "express";
import { healthRouter } from "./health.routes";
import { authRouter } from "./auth.routes";
import { productRouter } from "./product.routes";

function apiRouter() {
    const router = Router();
    router.use("/health", healthRouter);
    router.use("/auth", authRouter)
    router.use("/products", productRouter)
    return router;
}

export { apiRouter };
import { Router } from "express";
import { getProductByIdController, listProductsController } from "../controllers/product.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { catchAsync } from "../middlewares/catchAsync";

export const productRouter = Router()


// all routes are protected 

productRouter.use(authenticate);



productRouter.get("/", catchAsync(listProductsController));

productRouter.get("/:id", catchAsync(getProductByIdController))
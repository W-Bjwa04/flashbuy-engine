import { Router } from "express";
import { getProductByIdController, listProductsController } from "../controllers/product.controller";
import { authenticate } from "../middlewares/auth.middleware";

export const productRouter = Router()


// all routes are protected 

productRouter.use(authenticate);



productRouter.get("/", listProductsController);

productRouter.get("/:id", getProductByIdController)
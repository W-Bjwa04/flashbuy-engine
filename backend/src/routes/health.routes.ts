import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import { handleGetHealthCheck } from "../controllers/health.controller";


export const healthRouter = Router();

healthRouter.get("/", catchAsync(handleGetHealthCheck));

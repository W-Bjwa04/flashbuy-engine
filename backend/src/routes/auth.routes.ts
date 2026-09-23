import { Router } from "express"
import { authLoginController, authRegistrationController } from "../controllers/auth.controller";
import { catchAsync } from "../middlewares/catchAsync";

export const authRouter = Router();

// Register 

authRouter.post("/register", catchAsync(authRegistrationController));
authRouter.post("/login", catchAsync(authLoginController));

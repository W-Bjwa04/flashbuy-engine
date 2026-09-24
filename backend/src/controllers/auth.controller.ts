import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { sendResponse } from "../lib/response";
import { loginUserSchema, registerUserSchema } from "../validations/user.validation";
import { authLoginService, authRegistrationService } from "../services/auth.service";

export async function authRegistrationController(req: Request, res: Response) {

    // req body validation
    const validate = registerUserSchema.safeParse(req);

    if (!validate.success) {
        const errorMessage = validate.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");

        throw new AppError(400, `Validation error:${errorMessage}`)
    }

    // destructure the validate data
    const { name, email, password } = validate.data.body;

    // registration service
    const result = await authRegistrationService(name, email, password);

    // send response
    sendResponse(res, 200, "User registered successfully", result);
}


export async function authLoginController(req: Request, res: Response) {

    // req body validation
    const validate = loginUserSchema.safeParse(req);

    if (!validate.success) {
        const errorMessage = validate.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");

        throw new AppError(400, `Validation error:${errorMessage}`)
    }

    // destructure the validate data
    const { email, password } = validate.data.body;

    // login service
    const result = await authLoginService(email, password);


    // send response
    sendResponse(res, 200, "User logged in successfully", {
        accessToken: result.accessToken,
        user: {
            id: result.user.id,
            email: result.user.email,
        }
    });
}
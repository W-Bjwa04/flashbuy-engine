import { Request, Response } from "express";
import { sendResponse } from "../lib/response";
import { getProductByIdSchema, listProductsQuerySchema } from "../validations/product.validation";
import { AppError } from "../errors/AppError";
import { getProductByIdService, listProductsService } from "../services/product.service";

export async function listProductsController(req: Request, res: Response) {
    const validate = listProductsQuerySchema.safeParse(req);

    if (!validate.success) {
        const errorMessage = validate.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");
        throw new AppError(400, `Validation error: ${errorMessage}`);
    }

    const { flashSaleOnly, limit, offset } = validate.data.query;

    // Call service layer
    const result = await listProductsService(flashSaleOnly, limit, offset);

    sendResponse(res, 200, "Products fetched successfully", result);
}


export async function getProductByIdController(req: Request, res: Response) {

    // validate the product id
    const validate = getProductByIdSchema.safeParse(req)

    if (!validate.success) {
        const errorMessage = validate.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");
        throw new AppError(400, `Validation error: ${errorMessage}`);
    }

    const { id } = validate.data.params;

    const result = await getProductByIdService(id);

    sendResponse(res, 200, "Product fetched successfully", result);

}

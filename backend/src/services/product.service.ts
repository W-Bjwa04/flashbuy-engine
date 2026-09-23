import { AppError } from "../errors/AppError";
import { countProductsRepository, getProductByIdRepository, listProductsRepository } from "../repositories/product.repository";
import { ProductRecord } from "../types/product.types";

export async function listProductsService(
    flashSaleOnly: boolean = false,
    limit: number = 20,
    offset: number = 0
): Promise<{ products: ProductRecord[]; total: number }> {

    // Clean and simple orchestration. No SQL blocks here.
    const [totalProducts, dataResult] = await Promise.all([
        countProductsRepository(flashSaleOnly),
        listProductsRepository(flashSaleOnly, limit, offset)
    ]);

    if (totalProducts === 0) {
        return { products: [], total: 0 };
    }

    return { products: dataResult, total: totalProducts };
}


export async function getProductByIdService(id: string): Promise<ProductRecord | null> {

    const product = await getProductByIdRepository(id);

    if (!product) {
        throw new AppError(404, "Product not found");
    }
    return product;

}
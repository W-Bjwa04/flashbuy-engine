import { pool } from "../lib/db";
import { ProductRecord } from "../types/product.types";

export async function countProductsRepository(flashSaleOnly: boolean): Promise<number> {
    let query = `SELECT COUNT(*)::int AS total FROM products`;
    const params: any[] = [];

    if (flashSaleOnly) {
        query += ` WHERE is_flash_sale = $1`;
        params.push(true);
    }

    const result = await pool.query<{ total: number }>(query, params);
    return result.rows[0]?.total || 0;
}

export async function listProductsRepository(
    flashSaleOnly: boolean,
    limit: number,
    offset: number
): Promise<ProductRecord[]> {

    let query = `
      SELECT 
        id, title, description, price, official_stock, 
        is_flash_sale, flash_start_at, flash_end_at, 
        created_at, updated_at
      FROM products
    `;

    const params: any[] = [];

    // Dynamically build SQL clauses safely using proper positional parameters
    if (flashSaleOnly) {
        query += ` WHERE is_flash_sale = $${params.length + 1}`;
        params.push(true);
    }

    // Append Ordering, Limit, and Offset using safe parameters
    query += ` ORDER BY created_at DESC`;

    query += ` LIMIT $${params.length + 1}`;
    params.push(limit);

    query += ` OFFSET $${params.length + 1}`;
    params.push(offset);

    const result = await pool.query<ProductRecord>(query, params);
    return result.rows;
}


export async function getProductByIdRepository(id: string): Promise<ProductRecord | null> {
    const result = await pool.query<ProductRecord>(
        `
            SELECT 
                id, title, description, price, official_stock, 
                is_flash_sale, flash_start_at, flash_end_at, 
                created_at, updated_at
            FROM products 
            WHERE id = $1
        `,
        [id]
    );
    return result.rows[0] || null;
}
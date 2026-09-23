import { z } from 'zod';

export const getProductByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: 'Invalid product UUID format' }),
    }),
});

export const listProductsQuerySchema = z.object({
    query: z.object({
        // z.coerce handles strings like 'true' or 'false' and transforms them safely
        flashSaleOnly: z
            .coerce
            .boolean()
            .default(false),
        // z.coerce maps string integers ('1') straight to raw numbers (1)
        limit: z
            .coerce
            .number()
            .int()
            .min(1, 'Limit must be at least 1')
            .max(100, 'Limit cannot exceed 100')
            .default(20),
        offset: z
            .coerce
            .number()
            .int()
            .min(0, 'Offset cannot be negative')
            .default(0),
    }),
});

export type GetProductByIdParams = z.infer<typeof getProductByIdSchema>['params'];
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>['query'];

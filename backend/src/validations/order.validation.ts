import { z } from 'zod';

export const createOrderSchema = z.object({
    body: z.object({
        productId: z.string().uuid({ message: 'Invalid product UUID format' }),
        quantity: z.number().int().positive({ message: 'Quantity must be greater than 0' }),
        totalAmount: z.number().positive({ message: 'Total amount must be greater than 0' }),
    }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
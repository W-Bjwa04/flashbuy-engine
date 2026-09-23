import { z } from 'zod';

export const registerUserSchema = z.object({
    body: z.object({
        name: z
            .string({ message: 'Name is required' })
            .trim()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name cannot exceed 100 characters'),
        email: z
            .string({ message: 'Email is required' })
            .trim()
            .toLowerCase()
            .email('Invalid email address')
            .max(100, 'Email cannot exceed 100 characters'),
        password: z
            .string({ message: 'Password is required' })
            .min(6, 'Password must be at least 6 characters')
            .max(128, 'Password cannot exceed 128 characters'),
    }),
});

export const loginUserSchema = z.object({
    body: z.object({
        email: z
            .string({ message: 'Email is required' })
            .trim()
            .toLowerCase()
            .email('Invalid email address'),
        password: z
            .string()
            .min(1, 'Password is required'),
    }),
});

// Inferred TypeScript types from the Zod schemas
export type RegisterUserInput = z.infer<typeof registerUserSchema>['body'];
export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];

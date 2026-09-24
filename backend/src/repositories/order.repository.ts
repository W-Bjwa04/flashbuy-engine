import { pool } from "../lib/db";

export interface OrderItemDetail {
    id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: string;
    title: string;
    description: string;
}

export interface UserOrderRecord {
    id: string;
    user_id: string;
    total_amount: string;
    status: string;
    created_at: string;
    updated_at: string;
    items: OrderItemDetail[];
}

export async function getUserOrdersRepository(
    userId: string,
    status: string = "COMPLETED"
): Promise<UserOrderRecord[]> {
    const query = `
        SELECT 
            o.id,
            o.user_id,
            o.total_amount,
            o.status,
            o.created_at,
            o.updated_at,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', oi.id,
                        'product_id', oi.product_id,
                        'quantity', oi.quantity,
                        'price_at_purchase', oi.price_at_purchase,
                        'title', p.title,
                        'description', p.description
                    )
                ) FILTER (WHERE oi.id IS NOT NULL),
                '[]'::json
            ) AS items
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE o.user_id = $1 AND o.status = $2
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;

    const result = await pool.query<UserOrderRecord>(query, [userId, status]);
    return result.rows;
}

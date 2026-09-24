export interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: string;
    title: string;
    description: string;
}

export interface UserOrder {
    id: string;
    user_id: string;
    total_amount: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

export interface OrdersResponse {
    success: boolean;
    message: string;
    data: UserOrder[];
}

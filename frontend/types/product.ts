export interface Product {
    id: string;
    title: string;
    description: string;
    price: string;
    official_stock: number;
    is_flash_sale: boolean;
    flash_start_at: string | null;
    flash_end_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProductsResponse {
    success: boolean;
    message: string;
    data: {
        products: Product[];
        total: number;
    };
}

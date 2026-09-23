export type ProductRecord = {
    id: string;
    title: string;
    description: string | null;
    price: string; // pg returns numeric/decimal as string to preserve precision
    official_stock: number;
    is_flash_sale: boolean;
    flash_start_at: Date | null;
    flash_end_at: Date | null;
    created_at: Date;
    updated_at: Date;
}


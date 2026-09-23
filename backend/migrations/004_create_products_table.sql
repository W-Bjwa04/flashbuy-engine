-- Migration 004: Create products table with UUID primary key & stock integrity constraint
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    official_stock INT NOT NULL CHECK (official_stock >= 0),
    is_flash_sale BOOLEAN DEFAULT FALSE,
    flash_start_at TIMESTAMP WITH TIME ZONE,
    flash_end_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_flash_sale 
ON products(is_flash_sale) 
WHERE is_flash_sale = TRUE;
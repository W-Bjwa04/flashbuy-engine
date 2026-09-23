import { pool } from "../lib/db";
import logger from "../lib/logger";

interface SeedProduct {
    title: string;
    description: string;
    price: number;
    official_stock: number;
    is_flash_sale: boolean;
    flash_start_at?: Date | null;
    flash_end_at?: Date | null;
}

const dummyProducts: SeedProduct[] = [
    {
        title: "Flagship CyberPhone Pro Max",
        description: "Limited flash sale release. 200MP camera, 16GB RAM, titanium chassis.",
        price: 999.99,
        official_stock: 50,
        is_flash_sale: true,
        flash_start_at: new Date(),
        flash_end_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
    },
    {
        title: "Ultra-Wide Gaming Monitor 34\"",
        description: "Curved 144Hz 1ms IPS display with HDR400. Flash sale discount.",
        price: 399.00,
        official_stock: 30,
        is_flash_sale: true,
        flash_start_at: new Date(),
        flash_end_at: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours from now
    },
    {
        title: "Ergonomic Mechanical Keyboard",
        description: "Hot-swappable tactile switches with per-key RGB and memory foam wrist rest.",
        price: 129.50,
        official_stock: 100,
        is_flash_sale: true,
        flash_start_at: new Date(),
        flash_end_at: new Date(Date.now() + 1000 * 60 * 60 * 48), // 48 hours from now
    },
    {
        title: "Wireless Noise-Canceling Headphones",
        description: "High-fidelity audio with active noise cancellation and 30-hour battery life.",
        price: 299.99,
        official_stock: 200,
        is_flash_sale: false,
        flash_start_at: null,
        flash_end_at: null,
    },
    {
        title: "Stainless Steel Smart Water Bottle",
        description: "Temperature controlled, self-cleaning UV sterilization water bottle.",
        price: 59.95,
        official_stock: 350,
        is_flash_sale: false,
        flash_start_at: null,
        flash_end_at: null,
    },
];

async function seedProducts(): Promise<void> {
    const client = await pool.connect();

    try {
        logger.info("Starting product database seeding for FlashBuy...");

        await client.query("BEGIN");

        // Ensure title has a unique constraint so re-running the seed is idempotent
        await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_products_title ON products(title);
    `);

        for (const prod of dummyProducts) {
            const query = `
        INSERT INTO products (
          title,
          description,
          price,
          official_stock,
          is_flash_sale,
          flash_start_at,
          flash_end_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (title) DO UPDATE 
        SET official_stock = EXCLUDED.official_stock,
            price = EXCLUDED.price,
            is_flash_sale = EXCLUDED.is_flash_sale,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id, title, official_stock, is_flash_sale;
      `;

            const values = [
                prod.title,
                prod.description,
                prod.price,
                prod.official_stock,
                prod.is_flash_sale,
                prod.flash_start_at || null,
                prod.flash_end_at || null,
            ];

            const res = await client.query(query, values);
            const row = res.rows[0];
            logger.info(
                `Seeded product: [${row.id}] "${row.title}" (Stock: ${row.official_stock}, Flash: ${row.is_flash_sale})`
            );
        }

        await client.query("COMMIT");
        logger.info("Product database seeding completed successfully.");
    } catch (err) {
        await client.query("ROLLBACK");
        logger.error({ err }, "Product database seeding failed. Rolled back transaction.");
        throw err;
    } finally {
        client.release();
    }
}

seedProducts()
    .catch((err) => {
        logger.error({ err }, "Seeding terminated with errors");
        process.exit(1);
    })
    .finally(() => {
        pool.end();
    });
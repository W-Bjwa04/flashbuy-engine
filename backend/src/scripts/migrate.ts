import path from "path";
import { pool } from "../lib/db";
import fs from "fs";
import logger from "../lib/logger";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

// Ensure migrations folder exists
if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
}

// Table for tracking migrations 
const CREATE_MIGRATION_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS migrations(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT NOW() NOT NULL
)`;

type MigrationRow = {
    name: string;
};

async function getExecutedMigrations(): Promise<string[]> {
    const result = await pool.query<MigrationRow>(`SELECT name FROM migrations ORDER BY name`);
    return result.rows.map((row: MigrationRow) => row.name);
}

function getMigrationFiles(): string[] {
    try {
        const files = fs.readdirSync(MIGRATIONS_DIR);
        return files
            .filter((file: string) => file.endsWith(".sql"))
            .map((file: string) => path.join(MIGRATIONS_DIR, file))
            .sort();
    } catch (error) {
        logger.error({ error }, "Error reading migrations directory");
        return [];
    }
}

async function runMigration(migrationFile: string): Promise<void> {
    const sql = fs.readFileSync(migrationFile, "utf-8");
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        await client.query(sql);
        // Storing the base name (e.g. '001_init.sql')
        await client.query("INSERT INTO migrations (name) VALUES ($1)", [path.basename(migrationFile)]);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function migrate(): Promise<void> {
    await pool.query(CREATE_MIGRATION_TABLE_SQL);

    // Get list of already executed migrations
    const executedMigrations = new Set(await getExecutedMigrations());

    // Get all migration file absolute paths
    const migrationFiles = getMigrationFiles();

    // FIX: Filter checking the base filename against the database records
    const pendingMigrations = migrationFiles.filter(filePath => {
        const baseName = path.basename(filePath);
        return !executedMigrations.has(baseName);
    });

    if (pendingMigrations.length === 0) {
        logger.info("No pending migrations to run");
        return;
    }

    for (const migrationFile of pendingMigrations) {
        try {
            logger.info(`Running pending migration: ${path.basename(migrationFile)}`);
            await runMigration(migrationFile);
        } catch (error) {
            logger.error({ error }, `Failed to run migration: ${path.basename(migrationFile)}`);
            throw error;
        }
    }
    logger.info("All migrations completed successfully");
}

migrate().catch((error) => {
    logger.error({ err: error }, "Migration failed");
    process.exit(1);
}).finally(() => {
    pool.end();
})
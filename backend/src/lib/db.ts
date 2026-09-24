import { env } from "../config/env";
import { Pool } from "pg";

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
});


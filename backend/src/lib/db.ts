import { env } from "../config/env";
import { Pool } from "pg";
import logger from "./logger"; // Using your existing logger

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
});


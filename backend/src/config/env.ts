import dotenv from "dotenv";

dotenv.config();

function checkRequiredEnvVariables(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export const env = {
    PORT: Number(process.env.PORT ?? 3000),
    NODE_ENV: process.env.NODE_ENV ?? "development",
    LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
    API_PREFIX: process.env.API_PREFIX ?? "/api/v1",
    DATABASE_URL: checkRequiredEnvVariables("DATABASE_URL"),
    ACCESS_TOKEN_SECRET: checkRequiredEnvVariables("ACCESS_TOKEN_SECRET"),
    ACCESS_TOKEN_EXPIRES_IN: checkRequiredEnvVariables("ACCESS_TOKEN_EXPIRES_IN"),
} as const;

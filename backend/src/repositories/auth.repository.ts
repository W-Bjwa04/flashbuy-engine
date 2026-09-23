import { pool } from "../lib/db";
import { SafeUser, UserRecord } from "../types/auth.types";


export async function authRegistrationRepository(name: string, email: string, hashPassword: string): Promise<SafeUser> {

    const result = await pool.query<SafeUser>(
        `
    INSERT INTO users 
        (name, email, password_hash) 
    VALUES 
        ($1, $2, $3) 
    RETURNING 
        id, name, email, created_at, updated_at;
    `,
        [name, email, hashPassword]
    );

    return result.rows[0];

}

export async function findUserByEmailRepositiry(email: string): Promise<UserRecord | null> {
    const result = await pool.query<UserRecord>(
        `
            SELECT 
                id, name, email,password_hash, 
                created_at, 
                updated_at
            FROM users 
            WHERE email = $1
        `,
        [email]
    );

    return result.rows[0] || null;
}


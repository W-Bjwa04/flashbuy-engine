import { Request } from 'express';

// Represents the user entity stored in PostgreSQL (UUID-based)
export interface UserRecord {
    id: string; // UUID
    name: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

// User representation safe for client responses (no password_hash)
export interface SafeUser {
    id: string; // UUID
    name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

// Data embedded inside the signed JWT
export interface AuthJwtPayload {
    userId: string; // UUID matching users.id
    email: string;
    iat?: number;
    exp?: number;
}

// Custom authenticated Express Request carrying the verified token payload
export interface AuthenticatedRequest<
    P = Record<string, string>,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = qs.ParsedQs
> extends Request<P, ResBody, ReqBody, ReqQuery> {
    user?: AuthJwtPayload;
}

// Standardized Auth API responses
export interface AuthResponseSuccess {
    success: true;
    message: string;
    token: string;
    user: SafeUser;
}

export interface AuthResponseError {
    success: false;
    message: string;
    errors?: unknown;
}
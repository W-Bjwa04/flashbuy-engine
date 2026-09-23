import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { verifyToken } from '../lib/jwt';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    // 1. Check if header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError(401, "Unauthorized request: Missing or malformed token"));
    }

    // 2. Extract token safely (No non-null assertion needed)
    const token = authHeader.split(" ")[1];
    if (!token) {
        return next(new AppError(401, "Unauthorized request: Token missing"));
    }

    // 3. Verify the token 
    const payload = verifyToken(token);
    if (!payload) {
        return next(new AppError(401, "Invalid or expired token"));
    }

    // 4. Attach payload safely to request
    req.user = payload;

    next();
}

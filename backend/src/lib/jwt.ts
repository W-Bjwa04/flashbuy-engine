import { env } from "../config/env";
import { AuthJwtPayload } from "../types/auth.types";
import jwt, { SignOptions } from "jsonwebtoken";

export function signAccessToken(payload: AuthJwtPayload): string {
    const options: SignOptions = {
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
        algorithm: "HS256"
    };

    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, options);
}


export function verifyToken(token: string): AuthJwtPayload | null {
    try {
        const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
        return decoded as AuthJwtPayload;
    } catch (error) {
        return null;
    }
}
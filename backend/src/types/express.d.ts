import { AuthJwtPayload } from "./auth.types";

declare global {
    namespace Express {
        interface Request {
            user?: AuthJwtPayload;
        }
    }
}


export { }; 
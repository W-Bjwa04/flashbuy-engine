import { SafeUser } from "../types/auth.types";
import { AppError } from "../errors/AppError";
import bcrypt from "bcrypt";
import { authRegistrationRepository, findUserByEmailRepositiry } from "../repositories/auth.repository";
import { signAccessToken } from "../lib/jwt";


export async function authRegistrationService(name: string, email: string, password: string): Promise<SafeUser> {

    // find user by email 

    const existingUser = await findUserByEmailRepositiry(email);

    if (existingUser) {
        throw new AppError(400, "User with this email already exists");
    }

    // hash the password 

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await authRegistrationRepository(name, email, hashedPassword);

    if (!result) {
        throw new AppError(500, "User registration failed");
    }

    return result;

}



// generate token

export async function generateToken(userId: string, email: string) {
    return signAccessToken({
        userId,
        email
    });
}


export async function authLoginService(email: string, password: string) {

    //find the user by email 

    const existingUser = await findUserByEmailRepositiry(email);

    if (!existingUser) {
        throw new AppError(404, "User Login Failed");
    }


    const isPasswordMatched = await bcrypt.compare(password, existingUser.password_hash);

    if (!isPasswordMatched) {
        throw new AppError(400, "User Login Failed");
    }

    const accessToken = await generateToken(existingUser.id, existingUser.email);

    return {
        accessToken,
        user: existingUser
    };
}



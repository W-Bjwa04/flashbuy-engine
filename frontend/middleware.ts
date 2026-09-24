import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    // session.accessToken is no longer exposed to clients; use session.user as the auth signal
    const isLoggedIn = !!req.auth?.user;
    const { nextUrl } = req;

    const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";
    const isPublicRoute = nextUrl.pathname.startsWith("/api");

    // 1. If logged in, block them from seeing guest forms (/login, /register)
    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/", nextUrl));
        }
        return NextResponse.next();
    }

    // 2. If NOT logged in, protect everything except public paths
    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    // Protects all application routes except static assets and icons
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

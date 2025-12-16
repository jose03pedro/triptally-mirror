import { NextResponse, NextRequest } from 'next/server'

import jwt from "jsonwebtoken";
import {cookies} from "next/headers";
import {useUserStore} from "@/lib/store/userStore";

// Define the protected and public routes
const protectedRoutes = ['/profile']
const guestRoutes = ['/login', '/signup']

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Check if the current route is protected or public
    const isProtectedRoute = protectedRoutes.includes(path)
    const isGuestRoute = guestRoutes.includes(path)

    // Validate the session cookie (existence alone can be stale)
    const token = request.cookies.get("session")?.value;
    let isAuthenticated = false;

    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET!);
            isAuthenticated = true;
        } catch {
            // Stale/invalid cookie; treat as unauthenticated and clear it.
            isAuthenticated = false;
        }
    }

    // Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !isAuthenticated) {
        const res = NextResponse.redirect(new URL('/login', request.nextUrl))
        if (token) res.cookies.delete("session");
        return res;
    }

    // Redirect to /profile if the user is authenticated
    if (isGuestRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/profile', request.nextUrl))
    }

    // Continue
    const res = NextResponse.next();
    if (token && !isAuthenticated) res.cookies.delete("session");
    return res;
}
import { NextResponse, NextRequest } from 'next/server'
import {cookies} from "next/headers";

// Define the protected and public routes
const protectedRoutes = ['/profile']
const guestRoutes = ['/login', '/signup']

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Check if the current route is protected or public
    const isProtectedRoute = protectedRoutes.includes(path)
    const isGuestRoute = guestRoutes.includes(path)

    // Check if a 'session' cookie exists
    const cookieSession = (await cookies())?.get('session')?.name;

    // Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !cookieSession) {
        return NextResponse.redirect(new URL('/login', request.nextUrl))
    }

    // Redirect to /profile if the user is authenticated
    if (isGuestRoute && cookieSession) {
        return NextResponse.redirect(new URL('/profile', request.nextUrl))
    }
}
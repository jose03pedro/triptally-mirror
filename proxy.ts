import { NextResponse, NextRequest } from 'next/server'
import {cookies} from "next/headers";

// Define the protected and public routes
const protectedRoutes = ['/profile']
const publicRoutes = ['/login', '/signup', '/']

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Check if the current route is protected or public
    const isProtectedRoute = protectedRoutes.includes(path)
    const isPublicRoute = publicRoutes.includes(path)

    // Check if a 'session' cookie exists
    const cookieSession = (await cookies())?.get('session')?.name;

    // Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !cookieSession) {
        return NextResponse.redirect(new URL('/login', request.nextUrl))
    }

    // Redirect to /profile if the user is authenticated
    if (isPublicRoute && cookieSession && !request.nextUrl.pathname.startsWith('/profile')) {
        return NextResponse.redirect(new URL('/profile', request.nextUrl))
    }
}
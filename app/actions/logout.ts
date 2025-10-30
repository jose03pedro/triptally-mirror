'use server'

import {cookies} from "next/headers";

export async function logoutHandler() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    return true;
}
'use server'

import {cookies} from "next/headers";
import {useUserStore} from "@/lib/store/userStore";

export async function logoutHandler() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    useUserStore.getState().clearUser();
    return true;
}
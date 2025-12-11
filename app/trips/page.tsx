"use client";

import UserTrips from "@/app/components/trip/userTrips";
import {useUserStore} from "@/lib/store/userStore";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function TripsPage() {
    const { user } = useUserStore();
    const router = useRouter();

    // Redirect unauthenticated users to login
    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    return user && <UserTrips user={user} />;
}

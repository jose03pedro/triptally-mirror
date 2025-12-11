'use client'

import UserTrips from "@/app/components/trip/userTrips";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {User} from "@/types/user/types";
import {useUserStore} from "@/lib/store/userStore";

export default function OtherUserTrips() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string | undefined;

    const loggedUser = useUserStore((state) => state.user);

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        (async () => {
            try {
                if (!id) return;

                if (id === loggedUser?._id) {
                    router.replace("/trips");
                    return;
                }

                const userRes = await fetch(`/api/users/${id}`);
                if (!userRes.ok) {
                    console.error("Could not find user");
                    return;
                }

                const userData = await userRes.json();
                setUser(userData.user);
            } catch (e) {
                console.error("Failed loading data:", e);
            }
        })();
    }, [id, loggedUser, router]);

    return user && <UserTrips user={user} />;
}
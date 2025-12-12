'use client'

import UserProfile from "@/app/components/user/userProfile";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {User} from "@/types/user/types";
import {useUserStore} from "@/lib/store/userStore";

export default function OtherProfilePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string | undefined;

    const loggedUser = useUserStore((state) => state.user);

    const [user, setUser] = useState<User | null>(null);
    const [travelerProfile, setTravelerProfile] = useState<any | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                if (!id) return;

                // Redirect to /profile
                if (id === loggedUser?._id) router.replace("/profile");

                const userRes = await fetch(`/api/users/${id}`);
                if (!userRes.ok) throw new Error("Could not find user");

                const userData = await userRes.json();
                setUser(userData.user);
                setTravelerProfile(userData.travelerProfile);
            }
            catch (e) {
                console.error("Failed loading data:", e);
            }
        }
        loadData();
    }, [id, loggedUser, router]);

    return user && <UserProfile user={user} travelerProfile={travelerProfile} />;
}
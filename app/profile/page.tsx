"use client";

import {useUserStore} from "@/lib/store/userStore";
import UserProfile from "@/app/components/user/userProfile";
import {useEffect, useState} from "react";

export default function ProfilePage() {
    const { user, updateUser } = useUserStore();
    const [travelerProfile, setTravelerProfile] = useState<any | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                if (!user) return;

                const travelerRes = await fetch(`/api/traveler`, { cache: "no-store" });
                if (!travelerRes.ok) throw new Error("Could not find traveler profile for user");

                const travelerData = await travelerRes.json();
                setTravelerProfile(travelerData);
            } catch (err) {
                console.error("Failed loading data:", err);
            }
        }
        loadData();
    }, [user]);

    return user && <UserProfile user={user}
                                updateUser={updateUser}
                                travelerProfile={travelerProfile}
                                setTravelerProfile={setTravelerProfile} />;
}

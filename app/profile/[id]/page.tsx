'use client'

import UserProfile from "@/app/components/user/userProfile";
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {User} from "@/types/user/types";

export default function OtherProfilePage() {
    const params = useParams();
    const id = params?.id as string | undefined;

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                if (!id) return;

                const userRes = await fetch(`/api/users/${id}`);
                if (!userRes.ok) throw new Error("Could not find user");

                const userData = await userRes.json();
                setUser(userData.user);
            }
            catch (e) {
                console.error("Failed loading data:", e);
            }
        }
        loadData();
    }, [id]);

    return user && <UserProfile user={user} />;
}
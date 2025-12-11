"use client";

import {useUserStore} from "@/lib/store/userStore";
import UserProfile from "@/app/components/user/userProfile";

export default function ProfilePage() {
    const { user, updateUser } = useUserStore();
    return user && <UserProfile user={user} updateUser={updateUser}/>;
}

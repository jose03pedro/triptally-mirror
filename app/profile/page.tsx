"use client";

import { useAuth } from "@/lib/hook/useAuth";
import {UserCard} from "@/app/components/user/user-card";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function ProfilePage() {
  const session = useAuth();
  const router = useRouter();

  const user = session?.user;
  if (!user) return <p>User not found.</p>;

  return (
      <UserCard firstName={user.first_name} lastName={user.last_name} />
  );
}

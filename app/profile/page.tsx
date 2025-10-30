"use client";

import { useAuth } from "@/lib/hook/useAuth";
import {UserCard} from "@/app/ui/user-card";

export default function ProfilePage() {
  const session = useAuth();
  if (!session) return <p>Please log in first.</p>;

  const user = session?.user;
  if (!user) return <p>User not found.</p>;

  return (
      <UserCard firstName={user.first_name} lastName={user.last_name} />
  );
}

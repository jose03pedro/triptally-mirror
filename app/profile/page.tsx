"use client";

import { useAuth } from "@/lib/hook/useAuth";

export default function ProfilePage() {
  const user = useAuth();

  if (!user) return <p>Please log in first.</p>;

  return <h2>Welcome, {user.email}</h2>;
}

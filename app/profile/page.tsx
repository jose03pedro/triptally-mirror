"use client";

import { useAuth } from "@/lib/hook/useAuth";
import {UserCard} from "@/app/components/user/user-card";
import {useRouter} from "next/navigation";
import IconText from "@/app/components/ui/icon-text";
import CreateTripModal from "@/app/components/trip/createTripModal";

export default function ProfilePage() {
  const session = useAuth();
  const router = useRouter();

  const user = session?.user;
  if (!user) return <p>User not found.</p>;

  return (
      <>
        <UserCard firstName={user.first_name} lastName={user.last_name} />
        <button className="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#createTripModal">
            <IconText icon={"add"} text={"New trip"} />
        </button>
        <CreateTripModal/>
      </>
  );
}

"use client";

import { useAuth } from "@/lib/hook/useAuth";
import { UserCard } from "@/app/components/user/userCard";
import IconText from "@/app/components/ui/icon-text";
import CreateTripModal from "@/app/components/trip/createTripModal";
import { useEffect, useState } from "react";
import Link from "next/link";

type City = { name: string; country?: string };
type Trip = { _id: string; title: string; startDate: string; endDate?: string; cities?: City[]; userId?: string };

export default function ProfilePage() {
  const session = useAuth();
  const [upcoming, setUpcoming] = useState<Trip[]>([]);
  const user = session?.user;

  useEffect(() => {
    async function fetchUpcoming() {
      if (!user) return;
      try {
        const res = await fetch(`/api/trips?userId=${user.id}&upcoming=1`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setUpcoming(data.items || []);
      } catch (err) {
        console.error("Failed to load upcoming trips:", err);
      }
    }

    fetchUpcoming();
  }, [user]);

  if (!user) return <p>User not found.</p>;

  return (
    <>
      <UserCard firstName={user.first_name} lastName={user.last_name} />
      <div className="d-flex gap-3 align-items-start">
        <div>
          <button className="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#createTripModal">
            <IconText icon={"add"} text={"New trip"} color={"000"}/>
          </button>
          <CreateTripModal />
        </div>

        <div className="ms-4 mt-3">
          <h5>Upcoming trips</h5>
          {upcoming.length === 0 ? (
            <p className="text-muted">No upcoming trips.</p>
          ) : (
            <ul className="list-group">
              {upcoming.map((t) => (
                <li key={t._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <Link href={`/trips/${t._id}`} className="fw-bold">{t.title}</Link>
                    <div className="text-muted small">{t.cities?.map((c: City) => c.name).join(", ")}</div>
                  </div>
                  <div className="small text-muted">{new Date(t.startDate).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

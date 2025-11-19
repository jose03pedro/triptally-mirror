"use client";

import { useAuth } from "@/lib/hook/useAuth";
import { UserCard } from "@/app/components/user/userCard";
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

  if (!user) {
    return (
      <div className="pt-24 px-4">
        <p className="text-sm text-slate-500">User not found. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* User Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
           <UserCard firstName={user.first_name} lastName={user.last_name} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar: Actions */}
          <div className="lg:col-span-4 space-y-4">
             <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <button
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-500 transition shadow-sm hover:shadow-md"
                  data-bs-toggle="modal"
                  data-bs-target="#createTripModal"
                >
                  <span className="material-icons text-xl">add_circle_outline</span>
                  New Trip
                </button>
             </div>
             {/* We keep the modal here */}
             <CreateTripModal />
          </div>

          {/* Right Content: Trips */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Upcoming Adventures</h2>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{upcoming.length}</span>
            </div>
            
            {upcoming.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50">
                  <span className="material-icons text-4xl text-slate-300 mb-2">flight_takeoff</span>
                  <p className="text-sm font-medium text-slate-600">No upcoming trips yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Start planning your next adventure!</p>
               </div>
            ) : (
              <div className="grid gap-4">
                {upcoming.map((t) => (
                  <Link key={t._id} href={`/trips/${t._id}`} className="block group">
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm group-hover:shadow-md group-hover:border-blue-200 transition duration-200 relative overflow-hidden">
                       <div className="flex justify-between items-start relative z-10">
                          <div>
                             <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">{t.title}</h3>
                             <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                                <span className="material-icons text-[16px] text-slate-400">place</span>
                                {t.cities?.length ? t.cities.map((c: City) => c.name).join(", ") : "No cities"}
                             </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                {new Date(t.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1">{new Date(t.startDate).getFullYear()}</span>
                          </div>
                       </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
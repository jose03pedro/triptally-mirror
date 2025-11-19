import { UserIcon } from "@/app/components/user/userIcon";
import UserEditModal from "./userEditModal";
import { useState } from "react";

type UserCardProps = {
  firstName?: string;
  lastName?: string;
};

export function UserCard({ firstName, lastName }: UserCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || "Traveler";

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        {/* Avatar */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-100 opacity-40 blur-lg" />
          <div className="relative">
            <UserIcon size={72} />
          </div>
        </div>

        {/* Name + role */}
        <div className="space-y-1">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900 tracking-tight">
            {displayName}
          </h2>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
            <span className="material-icons text-[16px] text-blue-500">
              verified
            </span>
            <span>Traveler</span>
          </div>
        </div>

        {/* Edit button */}
        <div className="w-full pt-1">
          <button
            onClick={openModal}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs md:text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition"
          >
            <span className="material-icons text-[18px] text-slate-400">
              edit
            </span>
            Edit profile
          </button>
        </div>
      </div>

      {isModalOpen && <UserEditModal onClose={closeModal} />}
    </>
  );
}

import { UserIcon } from "@/app/components/user/userIcon";
import UserEditModal from "./userEditModal";
import { useState } from "react";

type UserCardProps = {
  firstName: string;
  lastName: string;
};

export function UserCard({ firstName, lastName }: UserCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Functions to control the modal's visibility
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-shrink-0">
           {/* Adjusted size to be slightly smaller/cleaner */}
           <UserIcon size={96} />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            {firstName} {lastName}
          </h2>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500">
             <span className="material-icons text-[18px] text-blue-500">verified</span>
             <span>Traveler</span>
          </div>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition"
          >
             <span className="material-icons text-[18px] text-slate-400">edit</span>
             Edit Profile
          </button>
        </div>

        {isModalOpen && <UserEditModal onClose={closeModal} />}
      </div>
    </>
  );
}
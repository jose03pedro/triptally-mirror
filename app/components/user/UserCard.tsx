import { UserIcon } from "@/app/components/user/UserIcon";
import { UserEditButton } from "@/app/components/user/UserEditButton";
import UserEditModal from "./UserEditModal";
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
      <div className={"d-flex flex-row align-items-center gap-4"}>
        <UserIcon size={120} />

        <div className="user-info">
          <p className="mb-0 fw-bold fs-5">
            {firstName} {lastName}
          </p>
        </div>

        <UserEditButton size={22} label="Edit Profile" onClick={openModal} className="" />
        {isModalOpen && <UserEditModal onClose={closeModal} />}
      </div>
    </>
  );
}

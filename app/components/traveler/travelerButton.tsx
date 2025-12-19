"use client";

import { useState } from "react";
import TravelerProfileModal from "./travelerProfileModal";
import IconText from "../ui/icon-text";

type EditButtonProps = {
  size?: number;
  label: string;
  className?: string;
  initialData?: any;
  onProfileUpdate?: (data: any) => void;
};

export function TravelerProfileButton({
  label,
  initialData,
  onProfileUpdate,
}: EditButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div>
        <button
          type="button"
          className={`btn btn-primary mt-3`}
          aria-label={label}
          onClick={openModal}
        >
          <IconText
            icon={initialData ? "edit" : "add"} // Change icon based on state
            text={label}
            color={"000"}
            type="outlined"
          />
        </button>
      </div>
      {isModalOpen && (
        <TravelerProfileModal
          onClose={closeModal}
          initialData={initialData}
          onProfileUpdate={onProfileUpdate}
        />
      )}
    </>
  );
}

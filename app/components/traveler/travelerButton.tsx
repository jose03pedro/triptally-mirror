"use client";

import { useState } from "react";
import TravelerProfileModal from "./travelerProfileModal";
import IconText from "../ui/icon-text";

type EditButtonProps = {
  size?: number;
  label: string;
  className?: string;
};

export function TravelerProfileButton({
  label,
}: EditButtonProps) {
  const [isModalOpen, setIsModalOpen] =
    useState(false);

  // Functions to control the modal's visibility
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
            icon={"add"}
            text={"Create Traveler Profile"}
            color={"000"}
          />
        </button>
      </div>
      {isModalOpen && (
        <TravelerProfileModal onClose={closeModal} />
      )}
    </>
  );
}

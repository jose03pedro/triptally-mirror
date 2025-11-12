"use client";

import Image from "next/image";
import editIcon from "../icons/edit.png";

type EditIconButtonProps = {
  size?: number;
  modalId: string; // e.g. "editUser"
  ariaLabel?: string;
  className?: string;
};

export function EditIconButton({
  size = 24,
  modalId,
  ariaLabel = "Edit",
  className = "",
}: EditIconButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center justify-center rounded-full p-1 border-0 outline-none focus:outline-none bg-transparent ${className}`}
      style={{ width: size + 8, height: size + 8 }}
      aria-label={ariaLabel}
      data-bs-toggle="modal"
      data-bs-target={`#${modalId}`}
    >
      <Image
        src={editIcon}
        alt={ariaLabel}
        width={size}
        height={size}
        className="pointer-events-none"
      />
    </button>
  );
}
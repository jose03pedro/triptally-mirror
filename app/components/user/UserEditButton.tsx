"use client";

import Image from "next/image";
import editIcon from "../icons/edit.png";

type EditButtonProps = {
  size?: number;
  label: string;
  onClick: () => void;
  className?: string;
};

export function UserEditButton({
  size = 24,
  label,
  onClick,
  className,
}: EditButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center justify-center rounded-full p-1 border-0 outline-none focus:outline-none bg-transparent ${className}`}
      style={{ width: size + 8, height: size + 8 }}
      aria-label={label}
      onClick={onClick}
    >
      <Image
        src={editIcon}
        alt={label}
        width={size}
        height={size}
        className="pointer-events-none"
      />
    </button>
  );
}
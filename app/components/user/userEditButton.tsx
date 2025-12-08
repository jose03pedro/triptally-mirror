"use client";

import Image from "next/image";
import editIcon from "../icons/edit.png";
import { ButtonHTMLAttributes } from "react";

interface UserEditButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  label: string;
}

export function UserEditButton({
  size = 24,
  label,
  className,
  ...props
}: UserEditButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center justify-center rounded-full p-1 border-0 outline-none focus:outline-none bg-transparent ${className || ""}`}
      style={{ width: size + 8, height: size + 8 }}
      aria-label={label}
      {...props}
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
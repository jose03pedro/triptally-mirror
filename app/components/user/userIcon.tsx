import Image from "next/image";
import { RoundIcon } from "../ui/roundIcon";

type UserIconProps = {
  url?: string;
  size: number;
};

export function UserIcon({ url, size }: UserIconProps) {
  const src = url ? url : "/default-profile.png";

  return <RoundIcon url={src} size={size} description="Profile" />;
}

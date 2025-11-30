import Image from "next/image";
import { RoundIcon } from "../ui/roundIcon";
import {useUserStore} from "@/lib/store/userStore";
import Avatar from "@mui/material/Avatar";

type UserIconProps = {
  size: number;
};

export function UserIcon({ size }: UserIconProps) {
  const { user } = useUserStore();

  return <Avatar
      alt={`${user?.first_name} ${user?.last_name} avatar`}
      src={user?.avatar}
      sx={{ height: size, width: size }}
  />;
}

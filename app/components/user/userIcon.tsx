"use client"

import {useUserStore} from "@/lib/store/userStore";
import Avatar from "@mui/material/Avatar";
import {User} from "@/types/user/types";

type UserIconProps = {
  size: number;
  user? : User;
};

export function UserIcon({ size, user }: UserIconProps) {
    const storeUser = useUserStore((s) => s.user);
    const finalUser = user ?? storeUser;

  return <Avatar
      alt={`${finalUser?.first_name} ${finalUser?.last_name} avatar`}
      src={finalUser?.avatar}
      sx={{ height: size, width: size }}
  />;
}

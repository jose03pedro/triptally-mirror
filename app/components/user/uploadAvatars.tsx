import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import { useState } from "react";
import {useUserStore} from "@/lib/store/userStore";
import {Badge} from "@mui/material";
import SmallAvatar from "@/app/components/user/smallAvatar";
import Tooltip from "@mui/material/Tooltip";

export default function UploadAvatars() {
    const { user } = useUserStore();
    const [avatarSrc, setAvatarSrc] = useState<string | undefined>(user?.avatar);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = typeof reader.result === "string" ? reader.result : "";
            setAvatarSrc(base64);
        };
        reader.readAsDataURL(selectedFile);
    };

    return (
        <>
            <Tooltip
                title="Update profile picture"
                slotProps={{
                    popper: {
                        modifiers: [
                            {
                                name: "offset",
                                options: {
                                    offset: [30, -10],
                                },
                            },
                        ],
                    },
                }}
            >
                <ButtonBase component="label" sx={{ display: "flex", alignItems: "center" }}>
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            <SmallAvatar />
                        }
                    >
                        <Avatar alt="Upload new avatar" src={avatarSrc} sx={{ width: 100, height: 100 }} />
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleAvatarChange}
                        />
                    </Badge>
                </ButtonBase>
            </Tooltip>
            <input type="hidden" name="avatar" value={avatarSrc ?? ""} />
        </>
    );
}


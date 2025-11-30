import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import { useState } from "react";

export default function UploadAvatars() {
    const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);

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

    return (<>
        <ButtonBase component="label" sx={{ display: "flex", alignItems: "center" }}>
            <Avatar alt="Upload new avatar" src={avatarSrc} sx={{ width: 100, height: 100 }} />
            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
            />
        </ButtonBase>
        <input type="hidden" name="avatar" value={avatarSrc} /></>
    );
}


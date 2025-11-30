import * as React from "react";
import Badge from "@mui/material/Badge";
import { Box, Tooltip } from "@mui/material";
import ModeEditIcon from '@mui/icons-material/ModeEdit';

interface SmallAvatarProps {
    size?: number;
}

export default function SmallAvatar({ size = 25 }: SmallAvatarProps) {
    return (
        <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
                <ModeEditIcon
                    sx={{
                        width: size,
                        height: size,
                        bgcolor: "#ddd",
                        borderRadius: "50%",
                        p: 0.5,
                    }}
                />
            }
        >
        </Badge>
    );
}

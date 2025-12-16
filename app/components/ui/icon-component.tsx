"use client";

interface IconProps {
    icon: string;
    type?: string;
    size?: number;
    color?: string;
}

export default function IconComponent({
                                 icon,
                                 type,
                                 size = 20,
                                 color = "#000",
                             }: IconProps) {
    return (
        <span
            className={
                type === "outlined"
                    ? "material-symbols-outlined md-dark"
                    : "material-icons md-dark"
            }
            style={{ fontSize: size, color }}
        >
      {icon}
    </span>
    );
}

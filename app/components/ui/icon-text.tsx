'use client'

import Icon from "@/app/components/ui/Icon";
import IconComponent from "@/app/components/ui/icon-component";


type IconTextProps = {
  icon: string;
  text: string;
  size?: number;
  color?: string;
  type?: string;
};

export default function IconText({
  icon,
  text,
  size = 20,
  color = "#000",
  type,
}: IconTextProps) {
  return (
    <div className="d-flex gap-1 align-items-center">

      <IconComponent icon={icon} size={size} color={color} type={type} />
      <span style={{ fontSize: size / 1.3, color: color }}>{text} </span>
    </div>
  );
}

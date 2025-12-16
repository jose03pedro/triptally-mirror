'use client'

type IconType = 'outlined' | 'filled' | string;

interface IconProps {
  icon: string;
  type?: IconType;
  size?: number;
  color?: string;
}

export default function Icon({
  icon,
  type,
  size = 20,
  color = '#000',
}: IconProps) {
  return (
    <span
      className={
        type === 'outlined'
          ? 'material-symbols-outlined md-dark'
          : 'material-icons md-dark'
      }
      style={{ fontSize: size, color }}
    >
      {icon}
    </span>
  );
}

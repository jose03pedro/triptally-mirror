import Image from "next/image";

interface ExpenseIconProps {
  color?: string;
  icon?: string;
  size: string;
}

export function ExpenseIcon({ color = "#fff", icon, size }: ExpenseIconProps) {
  return (
    <div
      className="category-icon rounded-circle overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        flexShrink: 0,
      }}
    ></div>
  );
}

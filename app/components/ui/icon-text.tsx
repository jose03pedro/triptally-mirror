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
      <span
        className={
          type === "outlined"
            ? `material-symbols-outlined md-dark`
            : `material-icons md-dark `
        }
        style={{ fontSize: size, color: color }}
      >
        {icon}
      </span>
      <span style={{ fontSize: size / 1.3, color: color }}>{text} </span>
    </div>
  );
}

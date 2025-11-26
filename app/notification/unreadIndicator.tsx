interface UnreadIndicatorProps {
  style?: React.CSSProperties;
}

export function UnreadIndicator({ style }: UnreadIndicatorProps) {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        backgroundColor: "#0d6efd",
        borderRadius: "50%",
        ...style,
      }}
    ></span>
  );
}

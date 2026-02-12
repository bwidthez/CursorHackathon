"use client";

export function Spinner({ style }: { style?: React.CSSProperties }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: "inline-block",
        width: 20,
        height: 20,
        border: "2px solid var(--surface-hover)",
        borderTopColor: "var(--primary)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        verticalAlign: "middle",
        marginRight: 8,
        ...style,
      }}
    />
  );
}

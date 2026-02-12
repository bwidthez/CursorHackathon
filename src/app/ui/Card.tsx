"use client";

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        borderRadius: "var(--radius)",
        background: "#ffffff",
        padding: "var(--spacing-lg)",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div style={{ marginBottom: "var(--spacing-md)" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>
        {title}
      </h2>
      {description && (
        <p style={{ marginTop: 4, fontSize: "0.875rem", color: "var(--muted)" }}>
          {description}
        </p>
      )}
    </div>
  );
}

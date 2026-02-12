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
        background: "var(--surface)",
        padding: "var(--spacing-lg)",
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
      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text)" }}>
        {title}
      </h2>
      {description && (
        <p style={{ marginTop: 4, fontSize: "0.875rem", color: "var(--text-muted)" }}>
          {description}
        </p>
      )}
    </div>
  );
}

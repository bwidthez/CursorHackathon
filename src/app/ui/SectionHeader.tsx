"use client";

export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header style={{ marginBottom: "var(--spacing-xl)" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em" }}>
        {title}
      </h1>
      {description && (
        <p style={{ marginTop: 6, color: "#6b7280", lineHeight: 1.6 }}>{description}</p>
      )}
    </header>
  );
}

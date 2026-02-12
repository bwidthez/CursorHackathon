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
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text)" }}>
        {title}
      </h1>
      {description && (
        <p style={{ marginTop: 4, color: "var(--text-muted)" }}>{description}</p>
      )}
    </header>
  );
}

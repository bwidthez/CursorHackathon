"use client";

import Link from "next/link";

const containerStyle: React.CSSProperties = {
  padding: "var(--spacing-xl)",
  maxWidth: 600,
  margin: "0 auto",
};

export default function Home() {
  return (
    <main style={containerStyle}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>RentShield</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "var(--spacing-xl)" }}>
        Northampton renters and landlords — powered by the Renters&apos; Rights Act 2025
      </p>

      <section style={{ marginBottom: "var(--spacing-xl)" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "var(--spacing-md)" }}>What do you need?</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li style={{ marginBottom: "var(--spacing-md)" }}>
            <Link
              href="/what-happened"
              style={{
                display: "block",
                padding: "var(--spacing-md)",
                background: "var(--surface)",
                borderRadius: "var(--radius)",
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              <strong>Get advice</strong> — Describe your situation and get guidance
            </Link>
          </li>
          <li style={{ marginBottom: "var(--spacing-md)" }}>
            <Link
              href="/notice-checker"
              style={{
                display: "block",
                padding: "var(--spacing-md)",
                background: "var(--surface)",
                borderRadius: "var(--radius)",
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              <strong>Check a notice</strong> — Paste a notice from your landlord; we&apos;ll check if it&apos;s valid
            </Link>
          </li>
          <li style={{ marginBottom: "var(--spacing-md)" }}>
            <Link
              href="/emergency"
              style={{
                display: "block",
                padding: "var(--spacing-md)",
                background: "var(--danger)",
                borderRadius: "var(--radius)",
                color: "#fecaca",
                textDecoration: "none",
              }}
            >
              <strong>Emergency help</strong> — Step-by-step guidance and voice instructions
            </Link>
          </li>
        </ul>
      </section>

      <p style={{ marginBottom: "var(--spacing-md)" }}>
        <Link href="/login" style={{ color: "var(--link)", fontWeight: 500 }}>Log in</Link>
        {" "}for tenants, landlords, and admins.
      </p>

      <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
        This is general information only, not legal advice. For your specific situation, consider
        contacting Shelter, Citizens Advice, or a solicitor.
      </p>
    </main>
  );
}

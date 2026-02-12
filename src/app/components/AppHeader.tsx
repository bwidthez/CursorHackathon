"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith("/tenant") || pathname?.startsWith("/landlord") || pathname?.startsWith("/admin")) {
    return null;
  }
  return (
    <header
      style={{
        background: "#ffffff",
        borderBottom: "1px solid var(--border-light)",
        padding: "var(--spacing-md) var(--spacing-xl)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "1.35rem",
            fontWeight: 700,
            color: "#111827",
            textDecoration: "none",
            letterSpacing: "-0.025em",
          }}
        >
          RentShield
        </Link>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0, letterSpacing: "0.02em", textTransform: "uppercase", fontWeight: 500 }}>
          Northampton &middot; Renters&apos; Rights Act 2025
        </p>
      </div>
    </header>
  );
}

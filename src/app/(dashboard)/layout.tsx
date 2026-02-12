"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "var(--spacing-md) var(--spacing-xl)",
  background: "var(--surface)",
  borderBottom: "1px solid var(--surface-hover)",
};

const navStyle: React.CSSProperties = {
  display: "flex",
  gap: "var(--spacing-md)",
  flexWrap: "wrap",
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: "var(--spacing-xl)",
  maxWidth: 900,
  margin: "0 auto",
  width: "100%",
};

function DashboardNav({ role }: { role: "tenant" | "landlord" | "admin" }) {
  const linkStyle: React.CSSProperties = {
    color: "var(--text-muted)",
    textDecoration: "none",
    fontSize: "0.875rem",
  };
  const activeLinkStyle: React.CSSProperties = { ...linkStyle, color: "var(--link)", fontWeight: 500 };
  const pathname = usePathname();

  if (role === "admin") {
    return (
      <nav style={navStyle}>
        <Link href="/admin" style={pathname === "/admin" ? activeLinkStyle : linkStyle}>
          Dashboard
        </Link>
        <Link href="/admin/landlords" style={pathname?.startsWith("/admin/landlords") ? activeLinkStyle : linkStyle}>
          Landlords
        </Link>
      </nav>
    );
  }
  if (role === "landlord") {
    return (
      <nav style={navStyle}>
        <Link href="/landlord" style={pathname === "/landlord" ? activeLinkStyle : linkStyle}>
          Dashboard
        </Link>
        <Link href="/landlord/tasks/new" style={pathname === "/landlord/tasks/new" ? activeLinkStyle : linkStyle}>
          Create task
        </Link>
      </nav>
    );
  }
  return (
    <nav style={navStyle}>
      <Link href="/tenant" style={pathname === "/tenant" ? activeLinkStyle : linkStyle}>
        Dashboard
      </Link>
      <Link href="/what-happened" style={linkStyle}>
        Get advice
      </Link>
      <Link href="/notice-checker" style={linkStyle}>
        Check notice
      </Link>
      <Link href="/emergency" style={linkStyle}>
        Emergency
      </Link>
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role: "tenant" | "landlord" | "admin" = pathname?.startsWith("/admin")
    ? "admin"
    : pathname?.startsWith("/landlord")
      ? "landlord"
      : "tenant";

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <Link href={role === "admin" ? "/admin" : role === "landlord" ? "/landlord" : "/tenant"} style={{ color: "var(--text)", textDecoration: "none", fontWeight: 600 }}>
          RentShield
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
          <DashboardNav role={role} />
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "capitalize" }}>
            {role}
          </span>
          <Link href="/" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none" }}>
            Log out
          </Link>
        </div>
      </header>
      <main style={mainStyle}>{children}</main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { Spinner } from "@/app/ui";

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "var(--spacing-sm) var(--spacing-xl)",
  background: "#ffffff",
  borderBottom: "1px solid var(--border-light)",
  boxShadow: "var(--shadow-sm)",
  flexWrap: "wrap",
  gap: "var(--spacing-sm)",
};

const navStyle: React.CSSProperties = {
  display: "flex",
  gap: "var(--spacing-md)",
  flexWrap: "wrap",
  alignItems: "center",
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: "var(--spacing-xl)",
  maxWidth: 960,
  margin: "0 auto",
  width: "100%",
};

function NavLinks({ role }: { role: string }) {
  const pathname = usePathname();
  const link = (href: string, label: string) => {
    const active = pathname === href || (href !== "/" && pathname?.startsWith(href + "/"));
    return (
      <Link
        href={href}
        style={{
          color: active ? "#111827" : "#6b7280",
          textDecoration: "none",
          fontSize: "0.875rem",
          fontWeight: active ? 600 : 500,
          padding: "4px 0",
          borderBottom: active ? "2px solid #111827" : "2px solid transparent",
        }}
      >
        {label}
      </Link>
    );
  };

  if (role === "admin") {
    return (
      <nav style={navStyle}>
        {link("/admin", "Dashboard")}
        {link("/admin/landlords", "Landlords")}
        {link("/admin/reviews", "Reviews")}
        {link("/admin/vouchers", "Vouchers")}
      </nav>
    );
  }
  if (role === "landlord") {
    return (
      <nav style={navStyle}>
        {link("/landlord", "Dashboard")}
        {link("/landlord/tasks/new", "Create task")}
        {link("/landlord/reviews", "Reviews")}
      </nav>
    );
  }
  return (
    <nav style={navStyle}>
      {link("/tenant", "Dashboard")}
      {link("/tenant/reviews", "Reviews")}
      {link("/tenant/vouchers", "Vouchers")}
      {link("/what-happened", "Get advice")}
      {link("/notice-checker", "Check notice")}
      {link("/emergency", "Emergency")}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const role = pathname?.startsWith("/admin")
    ? "admin"
    : pathname?.startsWith("/landlord")
      ? "landlord"
      : "tenant";

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12 }}>
        <Spinner /> <span style={{ color: "#6b7280" }}>Loading&hellip;</span>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <Link
          href={`/${role}`}
          style={{
            color: "#111827",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "1.15rem",
            letterSpacing: "-0.025em",
          }}
        >
          RentShield
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
          <NavLinks role={role} />
          <span
            style={{
              fontSize: "0.7rem",
              padding: "3px 10px",
              borderRadius: 999,
              background: role === "admin" ? "#f3f4f6" : role === "landlord" ? "#f3f4f6" : "#f3f4f6",
              color: "#374151",
              textTransform: "uppercase",
              fontWeight: 700,
              letterSpacing: "0.05em",
              border: "1px solid var(--border-light)",
            }}
          >
            {role}
          </span>
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{user.name}</span>
          <button
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              color: "#6b7280",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <main style={mainStyle}>{children}</main>
    </div>
  );
}

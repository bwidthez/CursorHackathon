"use client";

import Link from "next/link";
import { Card, CardHeader, ButtonLink } from "@/app/ui";

export default function AdminDashboardPage() {
  return (
    <>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--spacing-xl)" }}>
        Admin dashboard
      </h1>

      <div style={{ display: "grid", gap: "var(--spacing-md)", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", marginBottom: "var(--spacing-xl)" }}>
        <Card>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>Landlords</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: "var(--spacing-xs) 0 0" }}>0</p>
        </Card>
        <Card>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>Tenants</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: "var(--spacing-xs) 0 0" }}>0</p>
        </Card>
        <Card>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>Open tasks</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: "var(--spacing-xs) 0 0" }}>0</p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Landlords"
          description="Manage landlord accounts."
        />
        <ButtonLink href="/admin/landlords" variant="secondary" style={{ marginBottom: "var(--spacing-md)" }}>
          Create landlord
        </ButtonLink>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
          No landlords yet.
        </p>
      </Card>
    </>
  );
}

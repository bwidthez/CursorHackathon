"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, ButtonLink, Spinner } from "@/app/ui";

interface Stats {
  landlords: number;
  tenants: number;
  openTasks: number;
}

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [landlords, setLandlords] = useState<UserRow[]>([]);
  const [tenants, setTenants] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then((r) => r.json()),
      fetch("/api/dashboard/users?role=landlord").then((r) => r.json()),
      fetch("/api/dashboard/users?role=tenant").then((r) => r.json()),
    ]).then(([s, l, t]) => {
      setStats(s);
      setLandlords(l.users ?? []);
      setTenants(t.users ?? []);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load dashboard data. Please refresh the page.");
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: "var(--spacing-2xl)" }}><Spinner /> Loading dashboard…</div>;

  if (error) return <div style={{ textAlign: "center", padding: "var(--spacing-2xl)", color: "#dc2626" }}>{error}</div>;

  return (
    <>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "var(--spacing-xl)", letterSpacing: "-0.02em" }}>
        Admin dashboard
      </h1>

      {/* Stats row */}
      <div style={{ display: "grid", gap: "var(--spacing-md)", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", marginBottom: "var(--spacing-xl)" }}>
        {[
          { label: "Landlords", value: stats?.landlords ?? 0, color: "#111827" },
          { label: "Tenants", value: stats?.tenants ?? 0, color: "#111827" },
          { label: "Open tasks", value: stats?.openTasks ?? 0, color: "#d97706" },
        ].map((s) => (
          <Card key={s.label}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontSize: "2rem", fontWeight: 800, margin: "4px 0 0", color: s.color }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Landlords */}
      <Card style={{ marginBottom: "var(--spacing-lg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-md)" }}>
          <CardHeader title="Landlords" description={`${landlords.length} registered`} />
          <ButtonLink href="/admin/landlords" variant="secondary">Manage</ButtonLink>
        </div>
        {landlords.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No landlords yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "var(--spacing-sm)" }}>
            {landlords.map((l) => (
              <div key={l._id} style={{ display: "flex", justifyContent: "space-between", padding: "var(--spacing-sm) 0", borderBottom: "1px solid var(--border-light)" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>{l.name}</p>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>{l.email}</p>
                </div>
                <span style={{
                  fontSize: "0.7rem",
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: l.status === "active" ? "#f0fdf4" : "#fef2f2",
                  color: l.status === "active" ? "#16a34a" : "#dc2626",
                  alignSelf: "center",
                  fontWeight: 600,
                  border: `1px solid ${l.status === "active" ? "#bbf7d0" : "#fecaca"}`,
                }}>{l.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tenants */}
      <Card>
        <CardHeader title="Tenants" description={`${tenants.length} registered`} />
        {tenants.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No tenants yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "var(--spacing-sm)" }}>
            {tenants.map((t) => (
              <div key={t._id} style={{ display: "flex", justifyContent: "space-between", padding: "var(--spacing-sm) 0", borderBottom: "1px solid var(--border-light)" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>{t.name}</p>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>{t.email}</p>
                </div>
                <span style={{
                  fontSize: "0.7rem",
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "#f3f4f6",
                  color: "#374151",
                  alignSelf: "center",
                  fontWeight: 600,
                  border: "1px solid var(--border-light)",
                }}>tenant</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { Card, CardHeader, ButtonLink, Spinner } from "@/app/ui";

interface TaskRow {
  _id: string;
  title: string;
  description: string;
  rewardAmount: number;
  deadline: string;
  status: string;
  landlordName: string;
}

const statusColors: Record<string, { bg: string; fg: string }> = {
  open: { bg: "#eff6ff", fg: "#2563eb" },
  submitted: { bg: "#fffbeb", fg: "#d97706" },
  approved: { bg: "#f0fdf4", fg: "#16a34a" },
  rejected: { bg: "#fef2f2", fg: "#dc2626" },
};

export default function TenantDashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/dashboard/tasks?role=tenant&userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        setTasks(d.tasks ?? []);
        setLoading(false);
      });
  }, [user]);

  const totalReward = tasks.filter((t) => t.status === "approved").reduce((s, t) => s + t.rewardAmount, 0);
  const openCount = tasks.filter((t) => t.status === "open").length;

  return (
    <>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "var(--spacing-xl)" }}>
        Tenant dashboard
      </h1>

      {/* Quick stats */}
      <div style={{ display: "grid", gap: "var(--spacing-md)", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", marginBottom: "var(--spacing-xl)" }}>
        <Card>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Open tasks</p>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: "4px 0 0", color: "#111827" }}>{openCount}</p>
        </Card>
        <Card>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Earned</p>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: "4px 0 0", color: "#16a34a" }}>£{totalReward}</p>
        </Card>
      </div>

      <div style={{ display: "grid", gap: "var(--spacing-lg)", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
        {/* Legal tools */}
        <Card>
          <CardHeader title="Legal tools" description="Get guidance under the Renters' Rights Act 2025." />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            <ButtonLink href="/what-happened" variant="secondary" fullWidth>What just happened?</ButtonLink>
            <ButtonLink href="/notice-checker" variant="secondary" fullWidth>Check a notice</ButtonLink>
            <ButtonLink href="/emergency" variant="danger" fullWidth>Emergency help</ButtonLink>
          </div>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader title="My tasks" description={loading ? "Loading…" : `${tasks.length} total`} />
          {loading ? (
            <div style={{ textAlign: "center", padding: "var(--spacing-lg)" }}><Spinner /></div>
          ) : tasks.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No tasks assigned yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 0 }}>
              {tasks.map((t) => {
                const sc = statusColors[t.status] ?? statusColors.open;
                return (
                  <Link
                    key={t._id}
                    href={`/tenant/tasks/${t._id}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "var(--spacing-sm) 0",
                      borderBottom: "1px solid var(--border-light)",
                      textDecoration: "none",
                      color: "#111827",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem" }}>{t.title}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#6b7280" }}>
                        £{t.rewardAmount} · Due {new Date(t.deadline).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <span style={{
                      fontSize: "0.65rem",
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: sc.bg,
                      color: sc.fg,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}>{t.status}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

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
  tenantName: string;
}

const statusColors: Record<string, { bg: string; fg: string }> = {
  open: { bg: "#eff6ff", fg: "#2563eb" },
  submitted: { bg: "#fffbeb", fg: "#d97706" },
  approved: { bg: "#f0fdf4", fg: "#16a34a" },
  rejected: { bg: "#fef2f2", fg: "#dc2626" },
};

export default function LandlordDashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/dashboard/tasks?role=landlord&userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        setTasks(d.tasks ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "var(--spacing-xl)" }}>
        Landlord dashboard
      </h1>

      <Card style={{ marginBottom: "var(--spacing-lg)" }}>
        <CardHeader title="Create new task" description="Assign a task to one of your tenants." />
        <ButtonLink href="/landlord/tasks/new" fullWidth>Create task</ButtonLink>
      </Card>

      <Card>
        <CardHeader title="My tasks" description={loading ? "Loading…" : `${tasks.length} total`} />
        {loading ? (
          <div style={{ textAlign: "center", padding: "var(--spacing-lg)" }}><Spinner /></div>
        ) : tasks.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No tasks yet. Create one above.</p>
        ) : (
          <div style={{ display: "grid", gap: 0 }}>
            {tasks.map((t) => {
              const sc = statusColors[t.status] ?? statusColors.open;
              return (
                <Link
                  key={t._id}
                  href={`/landlord/tasks/${t._id}/submissions`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--spacing-md) 0",
                    borderBottom: "1px solid var(--border-light)",
                    textDecoration: "none",
                    color: "#111827",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{t.title}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#6b7280" }}>
                      Assigned to {t.tenantName} · £{t.rewardAmount} reward
                    </p>
                  </div>
                  <span style={{
                    fontSize: "0.7rem",
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: sc.bg,
                    color: sc.fg,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>{t.status}</span>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { Card, CardHeader, Button, Spinner } from "@/app/ui";

interface TaskData {
  _id: string;
  title: string;
  description: string;
  rewardAmount: number;
  deadline: string;
  status: string;
  tenantName: string;
}

interface Submission {
  _id: string;
  tenantName: string;
  comment: string;
  status: string;
  createdAt: string;
}

export default function LandlordTaskSubmissionsPage() {
  const params = useParams();
  const { user } = useAuth();
  const id = params?.id as string;
  const [task, setTask] = useState<TaskData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadData() {
    Promise.all([
      fetch(`/api/dashboard/tasks/${id}`).then((r) => r.json()),
      fetch(`/api/dashboard/submissions?taskId=${id}`).then((r) => r.json()),
    ]).then(([t, s]) => {
      setTask(t.task ?? null);
      setSubmissions(s.submissions ?? []);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load data. Please refresh the page.");
      setLoading(false);
    });
  }

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  async function handleAction(subId: string, status: "approved" | "rejected") {
    setActionId(subId);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/submissions/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewerId: user?.id }),
      });
      if (!res.ok) throw new Error("Action failed");
      loadData();
    } catch {
      setError("Failed to update submission. Please try again.");
    } finally {
      setActionId(null);
    }
  }

  if (loading) return <div style={{ textAlign: "center", padding: "var(--spacing-2xl)" }}><Spinner /> Loading…</div>;

  return (
    <>
      {error && (
        <div style={{ padding: "10px 14px", marginBottom: "var(--spacing-md)", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius)", color: "#dc2626", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}
      <Link href="/landlord" style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "var(--spacing-md)", display: "block", textDecoration: "none" }}>
        &larr; Back to dashboard
      </Link>

      {task && (
        <Card style={{ marginBottom: "var(--spacing-lg)" }}>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--spacing-sm)" }}>{task.title}</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "var(--spacing-xs)" }}>{task.description}</p>
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
            Assigned to <strong>{task.tenantName}</strong> · £{task.rewardAmount} reward · Due {new Date(task.deadline).toLocaleDateString("en-GB")}
          </p>
        </Card>
      )}

      <Card>
        <CardHeader title="Submissions" description={`${submissions.length} received`} />
        {submissions.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No submissions yet. The tenant hasn&apos;t responded.</p>
        ) : (
          <div style={{ display: "grid", gap: "var(--spacing-md)" }}>
            {submissions.map((s) => (
              <div key={s._id} style={{ padding: "var(--spacing-md)", background: "#f9fafb", borderRadius: "var(--radius)", border: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-sm)" }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{s.tenantName}</p>
                  <span style={{
                    fontSize: "0.7rem",
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: s.status === "approved" ? "#f0fdf4" : s.status === "rejected" ? "#fef2f2" : "#fffbeb",
                    color: s.status === "approved" ? "#16a34a" : s.status === "rejected" ? "#dc2626" : "#d97706",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    border: `1px solid ${s.status === "approved" ? "#bbf7d0" : s.status === "rejected" ? "#fecaca" : "#fde68a"}`,
                  }}>{s.status}</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>{s.comment || "No comment provided."}</p>
                <p style={{ margin: "var(--spacing-xs) 0 0", fontSize: "0.75rem", color: "#9ca3af" }}>{new Date(s.createdAt).toLocaleString("en-GB")}</p>
                {s.status === "pending" && (
                  <div style={{ display: "flex", gap: "var(--spacing-sm)", marginTop: "var(--spacing-sm)" }}>
                    <Button onClick={() => handleAction(s._id, "approved")} disabled={actionId === s._id}>
                      {actionId === s._id ? <><Spinner /> Processing…</> : "Approve"}
                    </Button>
                    <Button variant="danger" onClick={() => handleAction(s._id, "rejected")} disabled={actionId === s._id}>
                      {actionId === s._id ? <><Spinner /> Processing…</> : "Reject"}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

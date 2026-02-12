"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { Card, CardHeader, Button, Field, Textarea, Spinner } from "@/app/ui";

interface TaskData {
  _id: string;
  title: string;
  description: string;
  rewardAmount: number;
  deadline: string;
  status: string;
  landlordName: string;
}

export default function TenantTaskDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const id = params?.id as string;
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/dashboard/tasks/${id}`)
        .then((r) => r.json())
        .then((d) => {
          setTask(d.task ?? null);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load task. Please try again.");
          setLoading(false);
        });
    }
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !task) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task._id,
          tenantId: user.id,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div style={{ textAlign: "center", padding: "var(--spacing-2xl)" }}><Spinner /> Loading task…</div>;

  if (!task) return <p style={{ textAlign: "center", padding: "var(--spacing-2xl)", color: "#6b7280" }}>Task not found.</p>;

  const canSubmit = task.status === "open";

  return (
    <>
      <Link href="/tenant" style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "var(--spacing-md)", display: "block", textDecoration: "none" }}>
        &larr; Back to dashboard
      </Link>

      <Card style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--spacing-sm)" }}>{task.title}</h1>
        <p style={{ color: "#374151", lineHeight: 1.6, marginBottom: "var(--spacing-md)" }}>{task.description}</p>
        <div style={{ display: "flex", gap: "var(--spacing-lg)", fontSize: "0.85rem", color: "#6b7280" }}>
          <span>From <strong>{task.landlordName}</strong></span>
          <span>£{task.rewardAmount} reward</span>
          <span>Due {new Date(task.deadline).toLocaleDateString("en-GB")}</span>
        </div>
      </Card>

      {submitted ? (
        <Card style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <CardHeader title="Submitted!" description="Your landlord will review your submission." />
          <Button variant="secondary" onClick={() => router.push("/tenant")}>Back to dashboard</Button>
        </Card>
      ) : canSubmit ? (
        <Card>
          <CardHeader title="Submit evidence" description="Add a comment describing what you did, and optionally upload photos." />
          <form onSubmit={handleSubmit}>
            <Field label="Comment / description" name="comment">
              <Textarea
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe what you did and attach any notes…"
                rows={4}
              />
            </Field>
            {error && <p style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: "var(--spacing-md)", padding: "10px 14px", background: "#fef2f2", borderRadius: "var(--radius)", border: "1px solid #fecaca" }}>{error}</p>}
            <Button type="submit" disabled={submitting} fullWidth>
              {submitting ? <><Spinner /> Submitting…</> : "Submit evidence"}
            </Button>
          </form>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Status" />
          <p style={{ color: "#6b7280" }}>
            This task has already been <strong>{task.status}</strong>. No further action needed.
          </p>
        </Card>
      )}
    </>
  );
}

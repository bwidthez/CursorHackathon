"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { Card, CardHeader, Button, Field, Input, Textarea, Spinner } from "@/app/ui";

interface TenantOption {
  _id: string;
  name: string;
  email: string;
}

export default function LandlordNewTaskPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/users?role=tenant")
      .then((r) => r.json())
      .then((d) => {
        const list = d.users ?? [];
        setTenants(list);
        if (list.length > 0) setTenantId(list[0]._id);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !user) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordId: user.id,
          tenantId: tenantId || undefined,
          title: title.trim(),
          description: description.trim(),
          rewardAmount: parseFloat(reward) || 0,
          deadline: deadline || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/landlord");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Link href="/landlord" style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "var(--spacing-md)", display: "block", textDecoration: "none" }}>
        &larr; Back to dashboard
      </Link>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "var(--spacing-xl)" }}>
        Create task
      </h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <Field label="Assign to tenant" name="tenantId">
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius)",
                background: "#ffffff",
                border: "1px solid var(--border)",
                color: "#111827",
                font: "inherit",
                fontSize: "0.95rem",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {tenants.map((t) => (
                <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
              ))}
            </select>
          </Field>
          <Field label="Title" name="title">
            <Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Submit meter reading" required />
          </Field>
          <Field label="Description" name="description">
            <Textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What should the tenant do?" rows={3} />
          </Field>
          <Field label="Reward amount (£)" name="rewardAmount">
            <Input name="rewardAmount" type="number" value={reward} onChange={(e) => setReward(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Deadline" name="deadline">
            <Input name="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </Field>

          {error && <p style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: "var(--spacing-md)", padding: "10px 14px", background: "#fef2f2", borderRadius: "var(--radius)", border: "1px solid #fecaca" }}>{error}</p>}

          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Button type="submit" disabled={saving}>
              {saving ? <><Spinner /> Creating…</> : "Create task"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Card>
    </>
  );
}

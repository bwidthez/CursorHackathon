"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, Button, Field, Input, Spinner } from "@/app/ui";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function AdminLandlordsPage() {
  const [landlords, setLandlords] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function loadLandlords() {
    fetch("/api/dashboard/users?role=landlord")
      .then((r) => r.json())
      .then((d) => {
        setLandlords(d.users ?? []);
        setLoading(false);
      });
  }

  useEffect(() => { loadLandlords(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/dashboard/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role: "landlord" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(`Landlord created: ${email}`);
      setName("");
      setEmail("");
      loadLandlords();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "var(--spacing-xl)" }}>
        Manage landlords
      </h1>

      <Card style={{ marginBottom: "var(--spacing-xl)" }}>
        <CardHeader title="Create landlord" description="Add a new landlord account." />
        <form onSubmit={handleCreate}>
          <Field label="Name" name="name">
            <Input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
          </Field>
          <Field label="Email" name="email">
            <Input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
          </Field>
          <Field label="Initial password" name="password">
            <Input name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password123" />
          </Field>
          {message && <p style={{ fontSize: "0.85rem", color: message.includes("created") ? "#16a34a" : "#dc2626", marginBottom: "var(--spacing-md)", padding: "10px 14px", borderRadius: "var(--radius)", background: message.includes("created") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${message.includes("created") ? "#bbf7d0" : "#fecaca"}` }}>{message}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? <><Spinner /> Creating…</> : "Create landlord"}
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="All landlords" description={loading ? "Loading…" : `${landlords.length} total`} />
        {loading ? (
          <div style={{ textAlign: "center", padding: "var(--spacing-lg)" }}><Spinner /></div>
        ) : landlords.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No landlords yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 0 }}>
            {landlords.map((l) => (
              <div key={l._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--spacing-sm) 0", borderBottom: "1px solid var(--border-light)" }}>
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
                  fontWeight: 600,
                  border: `1px solid ${l.status === "active" ? "#bbf7d0" : "#fecaca"}`,
                }}>{l.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

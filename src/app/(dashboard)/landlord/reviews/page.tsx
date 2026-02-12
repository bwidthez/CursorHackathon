"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { Card, CardHeader, Button, Field, Input, Spinner } from "@/app/ui";

interface ReviewRow {
  id: string;
  tenantId: string;
  status: string;
  landlordNote: string | null;
  landlordPhotos: { url: string }[];
  tenantPhotos: { url: string }[];
  createdAt: string;
  adminVerdict: string | null;
}

const statusColors: Record<string, { bg: string; fg: string; border: string }> = {
  pending_admin_review: { bg: "#fffbeb", fg: "#d97706", border: "#fde68a" },
  approved: { bg: "#f0fdf4", fg: "#16a34a", border: "#bbf7d0" },
  rejected: { bg: "#fef2f2", fg: "#dc2626", border: "#fecaca" },
};

export default function LandlordReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Create review form
  const [tenantId, setTenantId] = useState("");
  const [note, setNote] = useState("");
  const [tenants, setTenants] = useState<{ _id: string; name: string; email: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Photo upload state
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function loadReviews() {
    fetch("/api/property-reviews")
      .then((r) => r.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadReviews();
    fetch("/api/dashboard/users?role=tenant")
      .then((r) => r.json())
      .then((d) => {
        const list = d.users ?? [];
        setTenants(list);
        if (list.length > 0) setTenantId(list[0]._id);
      });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/property-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, landlordNote: note.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "Failed");
      setMessage(`Review created: ${data.propertyReviewId}`);
      setNote("");
      loadReviews();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadPhotos(reviewId: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingId(reviewId);
    setUploadError(null);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      const res = await fetch(`/api/property-reviews/${reviewId}/photos`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? "Upload failed");
      }
      loadReviews();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <>
      <Link href="/landlord" style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "var(--spacing-md)", display: "block", textDecoration: "none" }}>
        &larr; Back to dashboard
      </Link>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "var(--spacing-xl)" }}>
        Property reviews
      </h1>

      {/* Create review */}
      <Card style={{ marginBottom: "var(--spacing-xl)" }}>
        <CardHeader title="Start a new review" description="Create a property condition review for a tenant." />
        <form onSubmit={handleCreate}>
          <Field label="Tenant" name="tenantId">
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius)", background: "#ffffff", border: "1px solid var(--border)", font: "inherit", fontSize: "0.95rem" }}
            >
              {tenants.map((t) => (
                <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
              ))}
            </select>
          </Field>
          <Field label="Note (optional)" name="note">
            <Input name="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any initial notes…" />
          </Field>
          {message && (
            <p style={{ fontSize: "0.85rem", color: message.includes("created") ? "#16a34a" : "#dc2626", marginBottom: "var(--spacing-md)", padding: "10px 14px", borderRadius: "var(--radius)", background: message.includes("created") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${message.includes("created") ? "#bbf7d0" : "#fecaca"}` }}>
              {message}
            </p>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? <><Spinner /> Creating…</> : "Create review"}
          </Button>
        </form>
      </Card>

      {uploadError && (
        <div style={{ padding: "10px 14px", marginBottom: "var(--spacing-md)", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius)", color: "#dc2626", fontSize: "0.875rem" }}>
          {uploadError}
        </div>
      )}

      {/* Review list */}
      <Card>
        <CardHeader title="All reviews" description={loading ? "Loading…" : `${reviews.length} total`} />
        {loading ? (
          <div style={{ textAlign: "center", padding: "var(--spacing-lg)" }}><Spinner /></div>
        ) : reviews.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No reviews yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "var(--spacing-md)" }}>
            {reviews.map((r) => {
              const sc = statusColors[r.status] ?? statusColors.pending_admin_review;
              return (
                <div key={r.id} style={{ padding: "var(--spacing-md)", background: "#f9fafb", borderRadius: "var(--radius)", border: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-sm)" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Review #{r.id.slice(-6)}</span>
                    <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 999, background: sc.bg, color: sc.fg, fontWeight: 700, textTransform: "uppercase", border: `1px solid ${sc.border}` }}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  {r.landlordNote && <p style={{ margin: "0 0 var(--spacing-sm)", fontSize: "0.85rem", color: "#374151" }}>{r.landlordNote}</p>}
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>
                    Your photos: {r.landlordPhotos.length} · Tenant photos: {r.tenantPhotos.length} · Created: {new Date(r.createdAt).toLocaleDateString("en-GB")}
                  </p>

                  {r.status === "pending_admin_review" && (
                    <div style={{ marginTop: "var(--spacing-sm)" }}>
                      <label style={{ display: "inline-block" }}>
                        <Button
                          variant="secondary"
                          type="button"
                          disabled={uploadingId === r.id}
                          onClick={() => {
                            const input = document.getElementById(`upload-${r.id}`) as HTMLInputElement;
                            input?.click();
                          }}
                        >
                          {uploadingId === r.id ? <><Spinner /> Uploading…</> : "Upload photos"}
                        </Button>
                        <input
                          id={`upload-${r.id}`}
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: "none" }}
                          onChange={(e) => handleUploadPhotos(r.id, e.target.files)}
                        />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}

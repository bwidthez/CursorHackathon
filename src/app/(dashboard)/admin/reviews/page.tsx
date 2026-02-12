"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, Button, Spinner } from "@/app/ui";

interface PhotoEntry {
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface ReviewRow {
  id: string;
  tenantId: string;
  landlordId: string;
  status: string;
  landlordNote: string | null;
  landlordPhotos: PhotoEntry[];
  tenantPhotos: PhotoEntry[];
  adminVerdict: string | null;
  voucherId: string | null;
  createdAt: string;
}

const statusColors: Record<string, { bg: string; fg: string; border: string }> = {
  pending_admin_review: { bg: "#fffbeb", fg: "#d97706", border: "#fde68a" },
  approved: { bg: "#f0fdf4", fg: "#16a34a", border: "#bbf7d0" },
  rejected: { bg: "#fef2f2", fg: "#dc2626", border: "#fecaca" },
};

const VOUCHER_OPTIONS = [
  { value: "amazon_10", label: "Amazon £10" },
  { value: "cinema_10", label: "Cinema £10" },
  { value: "coffee_5", label: "Coffee £5" },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function loadReviews() {
    fetch("/api/property-reviews")
      .then((r) => r.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadReviews(); }, []);

  async function handleVerdict(reviewId: string, verdict: "thumbs_up" | "thumbs_down") {
    setActionId(reviewId);
    setErrorMsg(null);
    try {
      const body: Record<string, string> = { verdict };
      if (verdict === "thumbs_up") {
        body.voucherType = selectedVoucher[reviewId] ?? "amazon_10";
      }
      const res = await fetch(`/api/property-reviews/${reviewId}/verdict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.detail ?? "Action failed. Please try again.");
      }
      loadReviews();
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <Link href="/admin" style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "var(--spacing-md)", display: "block", textDecoration: "none" }}>
        &larr; Back to dashboard
      </Link>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "var(--spacing-xl)" }}>
        Property reviews
      </h1>

      {errorMsg && (
        <div style={{ padding: "10px 14px", marginBottom: "var(--spacing-md)", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius)", color: "#dc2626", fontSize: "0.875rem" }}>
          {errorMsg}
        </div>
      )}

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
              const isPending = r.status === "pending_admin_review";
              return (
                <div key={r.id} style={{ padding: "var(--spacing-md)", background: "#f9fafb", borderRadius: "var(--radius)", border: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-sm)" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Review #{r.id.slice(-6)}</span>
                    <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 999, background: sc.bg, color: sc.fg, fontWeight: 700, textTransform: "uppercase", border: `1px solid ${sc.border}` }}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {r.landlordNote && (
                    <p style={{ margin: "0 0 var(--spacing-sm)", fontSize: "0.85rem", color: "#374151" }}>
                      <strong>Landlord note:</strong> {r.landlordNote}
                    </p>
                  )}

                  <p style={{ margin: "0 0 var(--spacing-sm)", fontSize: "0.8rem", color: "#6b7280" }}>
                    Landlord photos: {r.landlordPhotos.length} · Tenant photos: {r.tenantPhotos.length} · Created: {new Date(r.createdAt).toLocaleDateString("en-GB")}
                  </p>

                  {/* Photo thumbnails (placeholder squares since we don't store actual files) */}
                  {(r.landlordPhotos.length > 0 || r.tenantPhotos.length > 0) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "var(--spacing-sm)" }}>
                      {r.landlordPhotos.map((p, i) => (
                        <div
                          key={`l-${i}`}
                          style={{ width: 80, height: 80, borderRadius: 6, border: "2px solid #e5e7eb", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "#6b7280", textAlign: "center", padding: 4, position: "relative" }}
                        >
                          <span style={{ position: "absolute", top: 2, left: 2, fontSize: "0.6rem", background: "#e5e7eb", padding: "1px 4px", borderRadius: 4 }}>L</span>
                          Landlord<br />photo {i + 1}
                        </div>
                      ))}
                      {r.tenantPhotos.map((p, i) => (
                        <div
                          key={`t-${i}`}
                          style={{ width: 80, height: 80, borderRadius: 6, border: "2px solid #bfdbfe", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "#3b82f6", textAlign: "center", padding: 4, position: "relative" }}
                        >
                          <span style={{ position: "absolute", top: 2, left: 2, fontSize: "0.6rem", background: "#bfdbfe", padding: "1px 4px", borderRadius: 4 }}>T</span>
                          Tenant<br />photo {i + 1}
                        </div>
                      ))}
                    </div>
                  )}

                  {r.adminVerdict && (
                    <p style={{ margin: "0 0 var(--spacing-sm)", fontSize: "0.85rem", fontWeight: 600, color: r.adminVerdict === "thumbs_up" ? "#16a34a" : "#dc2626" }}>
                      Verdict: {r.adminVerdict === "thumbs_up" ? "Approved" : "Rejected"}
                      {r.voucherId && ` · Voucher issued`}
                    </p>
                  )}

                  {isPending && (
                    <div style={{ display: "flex", gap: "var(--spacing-sm)", alignItems: "center", marginTop: "var(--spacing-sm)", flexWrap: "wrap" }}>
                      <select
                        value={selectedVoucher[r.id] ?? "amazon_10"}
                        onChange={(e) => setSelectedVoucher((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        style={{ padding: "6px 10px", borderRadius: "var(--radius)", border: "1px solid var(--border)", font: "inherit", fontSize: "0.85rem" }}
                      >
                        {VOUCHER_OPTIONS.map((v) => (
                          <option key={v.value} value={v.value}>{v.label}</option>
                        ))}
                      </select>
                      <Button
                        onClick={() => handleVerdict(r.id, "thumbs_up")}
                        disabled={actionId === r.id}
                      >
                        {actionId === r.id ? <><Spinner /> Processing…</> : "Approve + issue voucher"}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleVerdict(r.id, "thumbs_down")}
                        disabled={actionId === r.id}
                      >
                        {actionId === r.id ? <><Spinner /> Processing…</> : "Reject"}
                      </Button>
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { Card, CardHeader, Button, Spinner } from "@/app/ui";

interface PhotoEntry {
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface ReviewRow {
  id: string;
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

export default function TenantReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
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
  }, []);

  async function handleUploadPhotos(reviewId: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingId(reviewId);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      const res = await fetch(`/api/property-reviews/${reviewId}/tenant-photos`, {
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
      <Link href="/tenant" style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "var(--spacing-md)", display: "block", textDecoration: "none" }}>
        &larr; Back to dashboard
      </Link>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "var(--spacing-xl)" }}>
        Property reviews
      </h1>

      {uploadError && (
        <div style={{ padding: "10px 14px", marginBottom: "var(--spacing-md)", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius)", color: "#dc2626", fontSize: "0.875rem" }}>
          {uploadError}
        </div>
      )}

      <Card>
        <CardHeader title="Your reviews" description={loading ? "Loading…" : `${reviews.length} total`} />
        {loading ? (
          <div style={{ textAlign: "center", padding: "var(--spacing-lg)" }}><Spinner /></div>
        ) : reviews.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No reviews for you yet. Your landlord will create one when needed.</p>
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
                    Landlord photos: {r.landlordPhotos.length} · Your photos: {r.tenantPhotos.length} · Created: {new Date(r.createdAt).toLocaleDateString("en-GB")}
                  </p>

                  {/* Photo thumbnails (placeholder squares since we don't store actual files) */}
                  {(r.landlordPhotos.length > 0 || r.tenantPhotos.length > 0) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "var(--spacing-sm)" }}>
                      {r.landlordPhotos.map((p, i) => (
                        <div
                          key={`l-${i}`}
                          style={{ width: 80, height: 80, borderRadius: 6, border: "2px solid #e5e7eb", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "#6b7280", textAlign: "center", padding: 4 }}
                        >
                          Landlord<br />photo {i + 1}
                        </div>
                      ))}
                      {r.tenantPhotos.map((p, i) => (
                        <div
                          key={`t-${i}`}
                          style={{ width: 80, height: 80, borderRadius: 6, border: "2px solid #93c5fd", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "#3b82f6", textAlign: "center", padding: 4 }}
                        >
                          Your<br />photo {i + 1}
                        </div>
                      ))}
                    </div>
                  )}

                  {r.adminVerdict && (
                    <p style={{ margin: "0 0 var(--spacing-sm)", fontSize: "0.85rem", fontWeight: 600, color: r.adminVerdict === "thumbs_up" ? "#16a34a" : "#dc2626" }}>
                      Verdict: {r.adminVerdict === "thumbs_up" ? "Approved — voucher issued!" : "Rejected"}
                    </p>
                  )}

                  {isPending && (
                    <div style={{ marginTop: "var(--spacing-sm)" }}>
                      <Button
                        variant="secondary"
                        type="button"
                        disabled={uploadingId === r.id}
                        onClick={() => {
                          const input = document.getElementById(`upload-tenant-${r.id}`) as HTMLInputElement;
                          input?.click();
                        }}
                      >
                        {uploadingId === r.id ? <><Spinner /> Uploading…</> : "Upload your photos"}
                      </Button>
                      <input
                        id={`upload-tenant-${r.id}`}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => handleUploadPhotos(r.id, e.target.files)}
                      />
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

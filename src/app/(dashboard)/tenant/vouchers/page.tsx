"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, Spinner } from "@/app/ui";

interface Voucher {
  id: string;
  tenantId: string;
  propertyReviewId: string;
  voucherType: string;
  voucherCode: string;
  voucherTypeLabel: string;
  issuedById: string;
  issuedAt: string;
  status: string;
}

function formatCode(code: string): string {
  // Format 16-digit code as 1234-5678-9012-3456
  return code.replace(/(.{4})(?=.)/g, "$1-");
}

export default function TenantVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vouchers")
      .then((r) => r.json())
      .then((data) => {
        setVouchers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Link href="/tenant" style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "var(--spacing-md)", display: "block", textDecoration: "none" }}>
        &larr; Back to dashboard
      </Link>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "var(--spacing-xl)" }}>
        My vouchers
      </h1>

      <Card>
        <CardHeader title="Earned vouchers" description={loading ? "Loading…" : `${vouchers.length} voucher(s)`} />
        {loading ? (
          <div style={{ textAlign: "center", padding: "var(--spacing-lg)" }}><Spinner /></div>
        ) : vouchers.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            No vouchers yet. Complete property reviews to earn rewards!
          </p>
        ) : (
          <div style={{ display: "grid", gap: "var(--spacing-md)" }}>
            {vouchers.map((v) => (
              <div
                key={v.id}
                style={{
                  padding: "var(--spacing-md)",
                  background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                  borderRadius: "var(--radius)",
                  border: "1px solid #bbf7d0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-sm)" }}>
                  <span style={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
                    {v.voucherTypeLabel}
                  </span>
                  <span style={{
                    fontSize: "0.7rem",
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "#f0fdf4",
                    color: "#16a34a",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    border: "1px solid #bbf7d0",
                  }}>
                    {v.status}
                  </span>
                </div>
                <p style={{
                  margin: "0 0 var(--spacing-sm)",
                  fontSize: "1.25rem",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#111827",
                  background: "#ffffff",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px dashed #d1d5db",
                  textAlign: "center",
                }}>
                  {formatCode(v.voucherCode)}
                </p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>
                  Issued: {new Date(v.issuedAt).toLocaleDateString("en-GB")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

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
  return code.replace(/(.{4})(?=.)/g, "$1-");
}

export default function AdminVouchersPage() {
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
      <Link href="/admin" style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "var(--spacing-md)", display: "block", textDecoration: "none" }}>
        &larr; Back to dashboard
      </Link>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "var(--spacing-xl)" }}>
        All vouchers
      </h1>

      <Card>
        <CardHeader title="Issued vouchers" description={loading ? "Loading…" : `${vouchers.length} voucher(s)`} />
        {loading ? (
          <div style={{ textAlign: "center", padding: "var(--spacing-lg)" }}><Spinner /></div>
        ) : vouchers.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No vouchers issued yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "var(--spacing-md)" }}>
            {vouchers.map((v) => (
              <div key={v.id} style={{ padding: "var(--spacing-md)", background: "#f9fafb", borderRadius: "var(--radius)", border: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-sm)" }}>
                  <span style={{ fontWeight: 600 }}>{v.voucherTypeLabel}</span>
                  <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 999, background: "#f0fdf4", color: "#16a34a", fontWeight: 700, textTransform: "uppercase", border: "1px solid #bbf7d0" }}>
                    {v.status}
                  </span>
                </div>
                <p style={{ margin: "0 0 var(--spacing-xs)", fontFamily: "monospace", letterSpacing: "0.05em", fontWeight: 600 }}>
                  {formatCode(v.voucherCode)}
                </p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>
                  Tenant: {v.tenantId.slice(-6)} · Review: {v.propertyReviewId.slice(-6)} · Issued: {new Date(v.issuedAt).toLocaleDateString("en-GB")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

"use client";

import Link from "next/link";
import { Card, CardHeader, Button, ButtonLink } from "@/app/ui";

export default function TenantDashboardPage() {
  return (
    <>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--spacing-xl)" }}>
        Tenant dashboard
      </h1>

      <div style={{ display: "grid", gap: "var(--spacing-lg)", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        <Card>
          <CardHeader
            title="My legal tools"
            description="Get advice and check notices under the Renters' Rights Act 2025."
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            <ButtonLink href="/what-happened" variant="secondary" fullWidth>
              What just happened?
            </ButtonLink>
            <ButtonLink href="/notice-checker" variant="secondary" fullWidth>
              Check a notice
            </ButtonLink>
            <ButtonLink href="/emergency" variant="danger" fullWidth>
              Emergency help
            </ButtonLink>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="My tasks"
            description="Tasks assigned to you by your landlord."
          />
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No tasks assigned yet.
          </p>
        </Card>
      </div>
    </>
  );
}

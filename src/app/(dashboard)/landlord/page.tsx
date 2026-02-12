"use client";

import Link from "next/link";
import { Card, CardHeader, ButtonLink } from "@/app/ui";

export default function LandlordDashboardPage() {
  return (
    <>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--spacing-xl)" }}>
        Landlord dashboard
      </h1>

      <Card style={{ marginBottom: "var(--spacing-lg)" }}>
        <CardHeader
          title="Create new task"
          description="Add a task for a tenant to complete."
        />
        <ButtonLink href="/landlord/tasks/new" fullWidth>
          Create task
        </ButtonLink>
      </Card>

      <Card>
        <CardHeader
          title="My tasks"
          description="Tasks you've created and their submission status."
        />
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          No tasks yet.
        </p>
      </Card>
    </>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardHeader, Button } from "@/app/ui";

export default function LandlordTaskSubmissionsPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <>
      <Link
        href="/landlord"
        style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "var(--spacing-md)", display: "block" }}
      >
        ← Back to dashboard
      </Link>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--spacing-xl)" }}>
        Submissions for task {id}
      </h1>

      <Card>
        <CardHeader title="Pending submissions" />
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
          No submissions yet.
        </p>
      </Card>
    </>
  );
}

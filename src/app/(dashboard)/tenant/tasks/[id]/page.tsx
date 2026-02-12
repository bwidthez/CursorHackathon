"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardHeader, Button, Field, Textarea } from "@/app/ui";

export default function TenantTaskDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <>
      <Link
        href="/tenant"
        style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "var(--spacing-md)", display: "block" }}
      >
        ← Back to dashboard
      </Link>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--spacing-xl)" }}>
        Task {id}
      </h1>

      <Card style={{ marginBottom: "var(--spacing-lg)" }}>
        <CardHeader title="Task details" description="Upload evidence and submit." />
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "var(--spacing-md)" }}>
          Task content will load here.
        </p>
        <form onSubmit={(e) => e.preventDefault()}>
          <Field label="Comment" name="comment">
            <Textarea name="comment" placeholder="Add a comment (optional)" rows={2} />
          </Field>
          <Button type="submit">Upload evidence and submit</Button>
        </form>
      </Card>
    </>
  );
}

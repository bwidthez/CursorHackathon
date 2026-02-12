"use client";

import Link from "next/link";
import { Card, CardHeader, Button, Field, Input, Textarea } from "@/app/ui";

export default function LandlordNewTaskPage() {
  return (
    <>
      <Link
        href="/landlord"
        style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "var(--spacing-md)", display: "block" }}
      >
        ← Back to dashboard
      </Link>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--spacing-xl)" }}>
        Create task
      </h1>

      <Card>
        <form onSubmit={(e) => e.preventDefault()}>
          <Field label="Title" name="title">
            <Input name="title" placeholder="e.g. Submit meter reading" />
          </Field>
          <Field label="Description" name="description">
            <Textarea name="description" placeholder="What should the tenant do?" rows={3} />
          </Field>
          <Field label="Reward amount (£)" name="rewardAmount">
            <Input name="rewardAmount" type="number" placeholder="0" />
          </Field>
          <Field label="Deadline" name="deadline">
            <Input name="deadline" type="date" />
          </Field>
          <Button type="submit" style={{ marginRight: "var(--spacing-sm)" }}>
            Create task
          </Button>
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </form>
      </Card>
    </>
  );
}

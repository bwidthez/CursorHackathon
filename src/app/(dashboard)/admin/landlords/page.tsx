"use client";

import { Card, CardHeader, Button, Field, Input } from "@/app/ui";

export default function AdminLandlordsPage() {
  return (
    <>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--spacing-xl)" }}>
        Manage landlords
      </h1>

      <Card style={{ marginBottom: "var(--spacing-xl)" }}>
        <CardHeader
          title="Create landlord"
          description="Add a new landlord account. They will receive login credentials."
        />
        <form onSubmit={(e) => e.preventDefault()}>
          <Field label="Name" name="name">
            <Input name="name" placeholder="Full name" />
          </Field>
          <Field label="Email" name="email">
            <Input name="email" type="email" placeholder="email@example.com" />
          </Field>
          <Button type="submit">Create landlord</Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="All landlords" />
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
          No landlords yet.
        </p>
      </Card>
    </>
  );
}

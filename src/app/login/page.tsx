"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, Button, Field, Input, SectionHeader } from "@/app/ui";

const containerStyle: React.CSSProperties = {
  padding: "var(--spacing-xl)",
  maxWidth: 400,
  margin: "0 auto",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"tenant" | "landlord" | "admin">("tenant");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.localStorage.setItem("rentshield_role", role);
    }
    if (role === "admin") router.push("/admin");
    else if (role === "landlord") router.push("/landlord");
    else router.push("/tenant");
  }

  return (
    <main style={containerStyle}>
      <Link
        href="/"
        style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "var(--spacing-md)", display: "block" }}
      >
        ← Back
      </Link>
      <SectionHeader
        title="Log in"
        description="Enter your details to access your dashboard."
      />

      <Card>
        <form onSubmit={handleSubmit}>
          <Field label="Email" name="email">
            <Input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </Field>
          <Field label="Password" name="password">
            <Input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </Field>
          <div style={{ marginBottom: "var(--spacing-md)" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "var(--spacing-xs)" }}>
              Log in as
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "tenant" | "landlord" | "admin")}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--radius)",
                background: "var(--surface)",
                border: "1px solid var(--surface-hover)",
                color: "var(--text)",
                font: "inherit",
              }}
            >
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" fullWidth>
            Log in
          </Button>
        </form>
      </Card>

      <p style={{ marginTop: "var(--spacing-md)", fontSize: "0.875rem", color: "var(--muted)" }}>
        Demo: choose a role and any email/password to open that dashboard.
      </p>
    </main>
  );
}

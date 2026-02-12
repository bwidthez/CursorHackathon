"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, Button, Field, Input, Spinner } from "@/app/ui";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--spacing-xl)",
  background: "#f7f8fa",
};

const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
};

const cardStyle: React.CSSProperties = {
  padding: "var(--spacing-2xl) var(--spacing-2xl) var(--spacing-xl)",
  borderRadius: 14,
  boxShadow: "var(--shadow-lg)",
  border: "1px solid var(--border-light)",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      const role = data.user.role;
      if (role === "admin") router.push("/admin");
      else if (role === "landlord") router.push("/landlord");
      else router.push("/tenant");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "var(--spacing-xl)" }}>
          <Link
            href="/login"
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#111827",
              textDecoration: "none",
              letterSpacing: "-0.03em",
            }}
          >
            RentShield
          </Link>
        </div>

        {/* Login card */}
        <Card style={cardStyle}>
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-xl)" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111827", marginBottom: 8, letterSpacing: "-0.02em" }}>
              Welcome back
            </h1>
            <p style={{ color: "#6b7280", fontSize: "1rem", margin: 0 }}>
              Sign in with your RentShield credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Field label="Email address" name="email">
              <Input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ padding: "12px 14px", fontSize: "1rem" }}
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
                style={{ padding: "12px 14px", fontSize: "1rem" }}
              />
            </Field>

            {error && (
              <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "var(--spacing-md)", padding: "10px 14px", background: "#fef2f2", borderRadius: "var(--radius)", border: "1px solid #fecaca" }} role="alert">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth disabled={loading} style={{ minHeight: 52, fontSize: "1.05rem", marginTop: 4 }}>
              {loading ? <><Spinner style={{ borderTopColor: "#ffffff" }} /> Signing in&hellip;</> : "Log in"}
            </Button>
          </form>
        </Card>

        {/* Demo accounts */}
        <Card style={{ marginTop: "var(--spacing-lg)", background: "#f9fafb", border: "1px solid var(--border-light)" }}>
          <CardHeader title="Demo accounts" description="Use these to test each role:" />
          <div style={{ fontSize: "0.85rem", lineHeight: 1.9, color: "#6b7280" }}>
            <p style={{ margin: "0 0 2px" }}><strong style={{ color: "#111827" }}>Admin:</strong> admin@rentshield.uk / admin123</p>
            <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "6px 0" }} />
            <p style={{ margin: "0 0 2px" }}><strong style={{ color: "#111827" }}>Landlord 1:</strong> landlord@rentshield.uk / landlord123</p>
            <p style={{ margin: "0 0 2px" }}><strong style={{ color: "#111827" }}>Landlord 2:</strong> margaret@rentshield.uk / landlord123</p>
            <p style={{ margin: "0 0 2px" }}><strong style={{ color: "#111827" }}>Landlord 3:</strong> david@rentshield.uk / landlord123</p>
            <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "6px 0" }} />
            <p style={{ margin: "0 0 2px" }}><strong style={{ color: "#111827" }}>Tenant 1:</strong> tenant@rentshield.uk / tenant123</p>
            <p style={{ margin: "0 0 2px" }}><strong style={{ color: "#111827" }}>Tenant 2:</strong> emma@rentshield.uk / tenant123</p>
            <p style={{ margin: "0 0 2px" }}><strong style={{ color: "#111827" }}>Tenant 3:</strong> amir@rentshield.uk / tenant123</p>
            <p style={{ margin: "0 0 2px" }}><strong style={{ color: "#111827" }}>Tenant 4:</strong> sophie@rentshield.uk / tenant123</p>
            <p style={{ margin: "0 0 2px" }}><strong style={{ color: "#111827" }}>Tenant 5:</strong> ryan@rentshield.uk / tenant123</p>
            <p style={{ margin: 0 }}><strong style={{ color: "#111827" }}>Tenant 6:</strong> fatima@rentshield.uk / tenant123</p>
          </div>
        </Card>
      </div>
    </main>
  );
}

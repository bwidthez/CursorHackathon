"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  Field,
  Textarea,
  SectionHeader,
  Spinner,
} from "@/app/ui";

const containerStyle: React.CSSProperties = {
  padding: "var(--spacing-2xl) var(--spacing-xl)",
  maxWidth: 800,
  margin: "0 auto",
};

export default function NoticeCheckerPage() {
  const [noticeText, setNoticeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    formType: string;
    grounds: string[];
    noticePeriodWeeks: number | null;
    issues: string[];
    summary: string;
    nextSteps: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!noticeText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/notice/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noticeText: noticeText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleTryAgain() {
    setError(null);
    setResult(null);
  }

  return (
    <main style={containerStyle}>
      <Link
        href="/tenant"
        style={{
          color: "#6b7280",
          fontSize: "0.875rem",
          marginBottom: "var(--spacing-md)",
          display: "block",
          textDecoration: "none",
        }}
      >
        &larr; Back to dashboard
      </Link>
      <SectionHeader
        title="Notice checker"
        description="Paste the text of a notice from your landlord. We'll check the form type, grounds, and notice period against the Renters' Rights Act 2025."
      />

      <form onSubmit={handleSubmit}>
        <Field label="Notice text" name="noticeText">
          <Textarea
            name="noticeText"
            value={noticeText}
            onChange={(e) => setNoticeText(e.target.value)}
            placeholder="Paste the full notice text here…"
            rows={8}
            disabled={loading}
          />
        </Field>
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? (
            <>
              <Spinner />
              Checking…
            </>
          ) : (
            "Check notice"
          )}
        </Button>
      </form>

      {error && (
        <Card style={{ marginTop: "var(--spacing-lg)", background: "#fef2f2", border: "1px solid #fecaca" }}>
          <p style={{ color: "#991b1b", marginBottom: "var(--spacing-sm)" }}>
            We couldn&apos;t check your notice. Please try again.
          </p>
          <Button variant="secondary" onClick={handleTryAgain}>
            Try again
          </Button>
        </Card>
      )}

      {result && (
        <section
          style={{ marginTop: "var(--spacing-xl)" }}
          role="status"
          aria-live="polite"
          aria-label="Notice check result"
        >
          <div
            style={{
              padding: "var(--spacing-md)",
              borderRadius: "var(--radius)",
              marginBottom: "var(--spacing-md)",
              background: result.valid ? "#f0fdf4" : "#fffbeb",
              borderLeft: `4px solid ${result.valid ? "#16a34a" : "#eab308"}`,
              border: `1px solid ${result.valid ? "#bbf7d0" : "#fde68a"}`,
              borderLeftWidth: 4,
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: "var(--spacing-xs)" }}>
              Form type: {result.formType}
              {result.grounds.length > 0 && ` · Grounds: ${result.grounds.join(", ")}`}
              {result.noticePeriodWeeks != null && ` · Notice period: ${result.noticePeriodWeeks} week(s)`}
            </p>
            <p style={{ margin: 0 }}>
              This notice appears <strong>{result.valid ? "VALID" : "INVALID or problematic"}</strong> under current rules.
            </p>
          </div>

          <Card>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{result.summary}</p>
            {result.issues.length > 0 && (
              <ul style={{ marginTop: "var(--spacing-md)", paddingLeft: "1.25rem", color: "#d97706" }}>
                {result.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            )}
            <div style={{ marginTop: "var(--spacing-md)" }}>
              <strong>Next steps:</strong>
              <ol style={{ paddingLeft: "1.25rem", marginTop: "var(--spacing-xs)" }}>
                {result.nextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </Card>
        </section>
      )}

      <p style={{ marginTop: "var(--spacing-xl)", fontSize: "0.85rem", color: "#9ca3af" }}>
        This is general information only, not legal advice. For your specific situation, consider
        contacting Shelter, Citizens Advice, or a solicitor.
      </p>
    </main>
  );
}

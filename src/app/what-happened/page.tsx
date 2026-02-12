"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
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

export default function WhatHappenedPage() {
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    advice: string;
    citations: { title: string; citation: string }[];
    confidence: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playVoice, setPlayVoice] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!situation.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: situation.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult({
        advice: data.advice,
        citations: data.citations ?? [],
        confidence: data.confidence ?? "medium",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handlePlayVoice() {
    if (!result?.advice) return;
    setPlayVoice(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: result.advice.slice(0, 3000) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "TTS failed");
      const audio = new Audio("data:audio/mp3;base64," + data.audioBase64);
      await audio.play();
    } catch {
      setError("Could not play audio. Please read the guidance above instead.");
    } finally {
      setPlayVoice(false);
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
        title="What just happened?"
        description="Describe your situation in plain language. We'll explain your rights and next steps under the Renters' Rights Act 2025."
      />

      <form onSubmit={handleSubmit}>
        <Field label="Your situation" name="situation">
          <Textarea
            name="situation"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="e.g. My landlord just told me I have to leave in two weeks."
            rows={4}
            disabled={loading}
          />
        </Field>
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? (
            <>
              <Spinner />
              Getting advice…
            </>
          ) : (
            "Get advice"
          )}
        </Button>
      </form>

      {error && (
        <Card style={{ marginTop: "var(--spacing-lg)", background: "#fef2f2", border: "1px solid #fecaca" }}>
          <p style={{ color: "#991b1b", marginBottom: "var(--spacing-sm)" }}>
            We couldn&apos;t load your advice. Please try again.
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
          aria-label="Advice result"
        >
          <Card>
            <CardHeader title="Your rights and next steps" />
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{result.advice}</p>
            {result.citations.length > 0 && (
              <div style={{ marginTop: "var(--spacing-md)", fontSize: "0.875rem", color: "#6b7280" }}>
                <strong style={{ color: "#374151" }}>Sources (Renters&apos; Rights Act 2025 and related law):</strong>
                <ul style={{ marginTop: "var(--spacing-xs)", paddingLeft: "1.25rem" }}>
                  {result.citations.map((c, i) => (
                    <li key={i}>
                      {c.title} — {c.citation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.confidence === "low" && (
              <p style={{ marginTop: "var(--spacing-md)", fontSize: "0.875rem", color: "#d97706", background: "#fffbeb", padding: "10px 14px", borderRadius: "var(--radius)", border: "1px solid #fde68a" }}>
                This situation may be complex. We recommend confirming with a housing adviser (Shelter, Citizens Advice).
              </p>
            )}
            <p style={{ marginTop: "var(--spacing-md)", fontSize: "0.875rem", color: "#6b7280" }}>
              For best results, find a quiet space.
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={handlePlayVoice}
              disabled={playVoice}
              style={{ marginTop: "var(--spacing-sm)" }}
            >
              {playVoice ? "Playing…" : "Listen aloud"}
            </Button>
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

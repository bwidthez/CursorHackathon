"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, SectionHeader, Spinner } from "@/app/ui";

const containerStyle: React.CSSProperties = {
  padding: "var(--spacing-xl)",
  maxWidth: 640,
  margin: "0 auto",
};

function boldKeySentences(text: string) {
  const keyPhrases = [
    "Do not leave the property",
    "Do not leave",
    "court order",
    "cannot force you out",
  ];
  let result = text;
  for (const phrase of keyPhrases) {
    const re = new RegExp(`(${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    result = result.replace(re, "**$1**");
  }
  return result.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

export default function EmergencyPage() {
  const [loading, setLoading] = useState(false);
  const [withVoice, setWithVoice] = useState(true);
  const [result, setResult] = useState<{
    script: string;
    audioBase64: string | null;
    councilReportUrl: string;
    nextSteps: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  async function handleActivate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withVoice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data);
      if (data.audioBase64 && withVoice) {
        const audio = new Audio("data:audio/mp3;base64," + data.audioBase64);
        audio.onplay = () => setPlaying(true);
        audio.onended = () => setPlaying(false);
        await audio.play();
      }
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
        href="/"
        style={{
          color: "var(--text-muted)",
          fontSize: "0.875rem",
          marginBottom: "var(--spacing-md)",
          display: "block",
        }}
      >
        ← Back
      </Link>
      <SectionHeader
        title="I'm being evicted right now"
        description="Use this for step-by-step guidance and voice instructions. Your landlord cannot force you out without a court order."
      />

      <label style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)" }}>
        <input
          type="checkbox"
          checked={withVoice}
          onChange={(e) => setWithVoice(e.target.checked)}
          aria-label="Play guidance aloud"
        />
        <span>Play guidance aloud (recommended)</span>
      </label>

      <Button
        type="button"
        variant="danger"
        onClick={handleActivate}
        disabled={loading}
        fullWidth
        style={{ padding: "var(--spacing-md) var(--spacing-lg)", fontSize: "1rem", fontWeight: 700 }}
      >
        {loading ? (
          <>
            <Spinner />
            Loading…
          </>
        ) : playing ? (
          "Playing guidance…"
        ) : (
          "Get emergency guidance now"
        )}
      </Button>

      {error && (
        <Card style={{ marginTop: "var(--spacing-lg)", background: "rgba(127, 29, 29, 0.3)" }}>
          <p style={{ color: "#fecaca", marginBottom: "var(--spacing-sm)" }}>
            We couldn&apos;t load guidance. Please try again.
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
          aria-label="Emergency guidance"
        >
          <Card>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "var(--spacing-md)" }}>What to do now</h2>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{boldKeySentences(result.script)}</p>
            <ul style={{ marginTop: "var(--spacing-md)", paddingLeft: "1.25rem" }}>
              {result.nextSteps.map((step, i) => (
                <li key={i} style={{ marginBottom: "var(--spacing-xs)" }}>
                  {step}
                </li>
              ))}
            </ul>
            <a
              href={result.councilReportUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "var(--spacing-md)",
                padding: "var(--spacing-sm) var(--spacing-md)",
                background: "var(--surface-hover)",
                color: "var(--link)",
                borderRadius: "var(--radius)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Report to West Northamptonshire Council →
            </a>
          </Card>
        </section>
      )}

      <p style={{ marginTop: "var(--spacing-xl)", fontSize: "0.875rem", color: "var(--muted)" }}>
        In immediate danger? Call 999. For housing advice: Shelter, Citizens Advice.
      </p>
    </main>
  );
}

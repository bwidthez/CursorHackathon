import { NextResponse } from "next/server";
import { chatCompletion } from "@/lib/ai/minimax";
import { getDb, COLLECTIONS } from "@/lib/db/mongodb";
import { getRelevantSections, RRA_SECTIONS, DISCLAIMER } from "@/lib/legal/rra2025";

const SYSTEM_PROMPT = `You are RentShield, a helpful assistant for renters and landlords in Northampton, UK. You explain rights and obligations under the Renters' Rights Act 2025 (in force from 1 May 2026). You are accurate, calm, and supportive.

Rules:
- Base your answer on UK housing law and the Renters' Rights Act 2025.
- Always cite specific points (e.g. "Under the Act, your landlord cannot evict you without a court order").
- Give clear next steps (e.g. "Do not leave the property", "Report to West Northamptonshire Council", "Contact Shelter or Citizens Advice").
- If the situation is unclear, say the user should confirm with a housing adviser or solicitor.
- End with a short disclaimer: "${DISCLAIMER}"
- Be concise but complete. Use plain language.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { situation } = body as { situation?: string };
    if (!situation || typeof situation !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'situation'" },
        { status: 400 }
      );
    }

    const sections = getRelevantSections(situation);
    const context =
      sections.length > 0
        ? "Relevant legal context:\n" +
          sections.map((s) => `- ${s.title}: ${s.summary} (${s.citation})`).join("\n")
        : "General context: " + RRA_SECTIONS.map((s) => s.title).join("; ");

    const result = await chatCompletion(
      [{ role: "user", content: situation }],
      {
        systemPrompt: SYSTEM_PROMPT + "\n\n" + context,
      }
    );

    const citations = sections.map((s) => ({ title: s.title, citation: s.citation }));

    const db = await getDb().catch(() => null);
    if (db) {
      await db.collection(COLLECTIONS.cases).insertOne({
        issueType: "advice",
        situation: situation.slice(0, 2000),
        advice: result.content.slice(0, 5000),
        citations,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      advice: result.content,
      citations,
      confidence: result.confidence ?? "medium",
    });
  } catch (e) {
    console.error("Advice API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to get advice" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { chatCompletion } from "@/lib/ai/minimax";
import { getDb, COLLECTIONS } from "@/lib/db/mongodb";
import { DISCLAIMER } from "@/lib/legal/rra2025";

const SYSTEM_PROMPT = `You are RentShield's notice checker. The user will paste or provide the text of a notice from their landlord (e.g. Section 8, Section 21, or other possession/eviction notice).

Your task:
1. Identify the type of notice (e.g. Section 8, Section 21, other).
2. Identify the ground(s) for possession if it's a Section 8 notice.
3. Check whether the notice period and form appear to comply with the Renters' Rights Act 2025 and Housing Act 1988. From 1 May 2026, no-fault (Section 21) evictions are abolished; only valid Section 8 grounds apply with correct notice periods.
4. Respond in this exact JSON shape (no markdown, no extra text):
{"valid": true or false, "formType": "Section 8" or "Section 21" or "Other", "grounds": ["ground name if any"], "noticePeriodWeeks": number or null, "issues": ["list of problems if invalid"], "summary": "One paragraph plain English summary for the tenant", "nextSteps": ["step 1", "step 2"]}

Then after the JSON, add: "DISCLAIMER: ${DISCLAIMER}"`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { noticeText } = body as { noticeText?: string };
    if (!noticeText || typeof noticeText !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'noticeText'" },
        { status: 400 }
      );
    }

    const result = await chatCompletion(
      [
        {
          role: "user",
          content: `Check this landlord notice:\n\n${noticeText.slice(0, 8000)}`,
        },
      ],
      { systemPrompt: SYSTEM_PROMPT }
    );

    // Try to parse JSON from the response
    const raw = result.content;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    let analysis: {
      valid: boolean;
      formType: string;
      grounds: string[];
      noticePeriodWeeks: number | null;
      issues: string[];
      summary: string;
      nextSteps: string[];
    };
    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[0]) as typeof analysis;
      } catch {
        analysis = {
          valid: false,
          formType: "Unknown",
          grounds: [],
          noticePeriodWeeks: null,
          issues: ["Could not parse notice. Please get it checked by a housing adviser."],
          summary: raw.slice(0, 500),
          nextSteps: ["Contact Shelter or Citizens Advice with a copy of the notice."],
        };
      }
    } else {
      analysis = {
        valid: false,
        formType: "Unknown",
        grounds: [],
        noticePeriodWeeks: null,
        issues: [],
        summary: raw.slice(0, 500),
        nextSteps: ["Confirm with a housing adviser (Shelter, Citizens Advice)."],
      };
    }

    const db = await getDb().catch(() => null);
    if (db) {
      await db.collection(COLLECTIONS.notices).insertOne({
        rawText: noticeText.slice(0, 5000),
        formType: analysis.formType,
        grounds: analysis.grounds,
        validity: analysis.valid,
        analysis: analysis.summary,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      valid: analysis.valid,
      formType: analysis.formType,
      grounds: analysis.grounds,
      noticePeriodWeeks: analysis.noticePeriodWeeks,
      issues: analysis.issues,
      summary: analysis.summary,
      nextSteps: analysis.nextSteps,
    });
  } catch (e) {
    console.error("Notice check API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to check notice" },
      { status: 500 }
    );
  }
}

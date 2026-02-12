import { NextResponse } from "next/server";
import { chatCompletion, textToSpeech } from "@/lib/ai/minimax";
import { getDb, COLLECTIONS } from "@/lib/db/mongodb";

const EMERGENCY_SCRIPT = `If you are being told to leave right now, listen carefully.

First: Do not leave the property. Your landlord cannot force you out without a court order. Lock the door if you need to feel safe.

Second: You do not have to leave today. Under the Renters' Rights Act, they must give you proper notice and get a court order. Anyone trying to remove you without that may be committing illegal eviction.

Third: Report it. Contact West Northamptonshire Council to report illegal eviction. You can find their contact details on westnorthants.gov.uk. You can also call Shelter's emergency helpline for housing advice.

Fourth: If you feel in danger, call the police on 101, or 999 if it is an emergency.

I will now repeat the most important point: Do not leave unless a court has ordered possession and bailiffs attend. You have rights.`;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { withVoice = false, location } = body as { withVoice?: boolean; location?: { lat?: number; lng?: number } };

    const script =
      EMERGENCY_SCRIPT +
      (location?.lat != null && location?.lng != null
        ? ` Your location has been recorded for your report (Northampton area).`
        : "");

    const db = await getDb().catch(() => null);
    if (db) {
      await db.collection(COLLECTIONS.cases).insertOne({
        issueType: "emergency_eviction",
        situation: "User triggered emergency eviction response",
        advice: script.slice(0, 2000),
        citations: [{ title: "Illegal eviction", citation: "Protection from Eviction Act 1977" }],
        location: location ?? null,
        createdAt: new Date(),
      });
    }

    let audioBase64: string | null = null;
    if (withVoice) {
      try {
        const tts = await textToSpeech(script);
        audioBase64 = tts.audioBase64;
      } catch (e) {
        console.warn("Emergency TTS failed:", e);
      }
    }

    const councilUrl =
      "https://www.westnorthants.gov.uk/private-housing-tenants-and-landlords/housing-disrepair-and-enforcement-housing-conditions";

    return NextResponse.json({
      script,
      audioBase64,
      councilReportUrl: councilUrl,
      nextSteps: [
        "Do not leave the property.",
        "Report to West Northamptonshire Council (see link in response).",
        "Call Shelter or Citizens Advice for immediate support.",
      ],
    });
  } catch (e) {
    console.error("Emergency API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to get emergency guidance" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { textToSpeech } from "@/lib/ai/minimax";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body as { text?: string };
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'text'" }, { status: 400 });
    }

    const result = await textToSpeech(text.slice(0, 5000));
    return NextResponse.json({
      audioBase64: result.audioBase64,
      format: result.format,
    });
  } catch (e) {
    console.error("TTS API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "TTS failed" },
      { status: 500 }
    );
  }
}

/**
 * MiniMax API client: LLM (chat) + TTS (text-to-speech).
 * Base URL: https://api.minimax.io
 */

import type { AIService, ChatMessage, ChatCompletionResult, TTSResult } from "./provider";

const MINIMAX_BASE = "https://api.minimax.io";

function getApiKey(): string {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) throw new Error("MINIMAX_API_KEY is not set");
  return key;
}

/**
 * Chat completion using MiniMax M2-style endpoint.
 * Uses chatcompletion_v2 with a capable model.
 */
export async function chatCompletion(
  messages: { role: string; content: string }[],
  options?: { model?: string; systemPrompt?: string }
): Promise<ChatCompletionResult> {
  const apiKey = getApiKey();
  const model = options?.model ?? "M2-her";

  const body: Record<string, unknown> = {
    model,
    messages: [
      ...(options?.systemPrompt
        ? [{ role: "system", content: options.systemPrompt }]
        : []),
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : m.role,
        content: m.content,
      })),
    ],
    max_tokens: 2048,
    temperature: 0.3,
  };

  const res = await fetch(`${MINIMAX_BASE}/v1/text/chatcompletion_v2`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MiniMax chat failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    base_resp?: { status_code?: number };
  };

  if (data.base_resp?.status_code !== 0 && data.base_resp?.status_code !== undefined) {
    throw new Error(`MiniMax API error: ${JSON.stringify(data.base_resp)}`);
  }

  const content =
    data.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again or confirm with a housing adviser.";

  return {
    content,
    confidence: "medium",
  };
}

/**
 * Text-to-speech using MiniMax T2A v2.
 * Returns base64-encoded audio (e.g. mp3).
 */
export async function textToSpeech(
  text: string,
  options?: { voiceId?: string; model?: string }
): Promise<TTSResult> {
  const apiKey = getApiKey();
  const model = options?.model ?? "speech-02-turbo";
  const voiceId = options?.voiceId ?? "English_expressive_narrator";

  const res = await fetch(`${MINIMAX_BASE}/v1/t2a_v2`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      text: text.slice(0, 10000),
      voice_setting: {
        voice_id: voiceId,
        speed: 1,
        vol: 1,
        pitch: 0,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: "mp3",
        channel: 1,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MiniMax TTS failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    data?: { audio?: string; ced?: string; status?: number } | string;
    extra_info?: { audio_type?: string };
    base_resp?: { status_code?: number };
  };

  if (data.base_resp?.status_code !== 0 && data.base_resp?.status_code !== undefined) {
    throw new Error(`MiniMax TTS API error: ${JSON.stringify(data.base_resp)}`);
  }

  // MiniMax returns data.data as either a string or { audio: string, ... }
  let audioHex = "";
  if (typeof data.data === "string") {
    audioHex = data.data;
  } else if (data.data && typeof data.data === "object" && data.data.audio) {
    audioHex = data.data.audio;
  }
  if (!audioHex) throw new Error("MiniMax TTS returned no audio");

  // MiniMax returns hex-encoded audio — convert to base64 for the browser
  const audioBase64 = Buffer.from(audioHex, "hex").toString("base64");

  return {
    audioBase64,
    format: "mp3",
  };
}

/**
 * MiniMax implementation of AIService.
 */
export const minimaxService: AIService = {
  async chat(messages: ChatMessage[], systemContext?: string): Promise<ChatCompletionResult> {
    const formatted = messages.map((m) => ({ role: m.role, content: m.content }));
    return chatCompletion(formatted, { systemPrompt: systemContext });
  },

  async textToSpeech(
    text: string,
    options?: { voiceId?: string; language?: string }
  ): Promise<TTSResult> {
    return textToSpeech(text, { voiceId: options?.voiceId });
  },
};

/**
 * AI provider abstraction so MiniMax can be swapped if needed.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResult {
  content: string;
  confidence?: "high" | "medium" | "low";
}

export interface TTSResult {
  audioBase64: string;
  format: string;
}

export interface AIService {
  chat(messages: ChatMessage[], systemContext?: string): Promise<ChatCompletionResult>;
  textToSpeech(text: string, options?: { voiceId?: string; language?: string }): Promise<TTSResult>;
}

import "server-only";

import type { OutfitProposal, Scene } from "@/types/outfit";
import type { WeatherSnapshot } from "@/types/weather";

import { OUTFIT_RESPONSE_SCHEMA, buildOutfitPrompt } from "./prompt";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  error?: { message?: string };
};

export async function generateOutfit(
  weather: WeatherSnapshot,
  scene: Scene
): Promise<OutfitProposal> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY が設定されていません");
  }

  const prompt = buildOutfitPrompt(weather, scene);

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: OUTFIT_RESPONSE_SCHEMA,
        temperature: 0.9,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as GeminiResponse;
  if (data.error?.message) {
    throw new Error(`Gemini API error: ${data.error.message}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini から空のレスポンスが返りました");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Gemini レスポンスを JSON として解析できませんでした: ${text.slice(0, 200)}`);
  }

  return parsed as OutfitProposal;
}

import type { Scene } from "@/types/outfit";
import type { WeatherSnapshot } from "@/types/weather";

export function buildOutfitPrompt(
  weather: WeatherSnapshot,
  scene: Scene
): string {
  const current = weather.current;
  const tomorrow = weather.tomorrow;
  const todayPopPercent = Math.round(current.pop * 100);
  const tomorrowPopPercent = Math.round(tomorrow.pop * 100);

  return [
    "あなたは天気とTPOに合わせて服装を提案するスタイリストです。",
    "",
    "## 条件",
    `- 地域: ${weather.region}`,
    `- 今日の天気: ${current.description}、気温 ${current.temp}°C (体感 ${current.feelsLike}°C)、降水確率 ${todayPopPercent}%`,
    `- 明日の天気: ${tomorrow.description}、最高 ${tomorrow.tempMax}°C / 最低 ${tomorrow.tempMin}°C、降水確率 ${tomorrowPopPercent}%`,
    `- シーン: ${scene}`,
    "",
    "## 要件",
    "- トップス・ボトムス・アウター・小物 を具体的なアイテム名で日本語で記述してください",
    "- 気温に応じてアウターは不要な場合があります。その場合は `outer` に「不要」と入れてください",
    "- 降水確率が30%以上なら傘や撥水素材など雨対策を小物または記述に含めてください",
    "- おすすめカラーは 3〜5 色を hex code (#RRGGBB) で。コーデの中で実際に使う色を返してください",
    "- ワンポイントアドバイスは1〜2文の日本語",
    "- imageKeywords は Unsplash 検索用の英語キーワードを 2〜3 個。'shirt outfit' のように検索しやすい語にしてください",
    "- 出力は指定の JSON スキーマに従ってください",
  ].join("\n");
}

export const OUTFIT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    tops: { type: "string" },
    bottoms: { type: "string" },
    outer: { type: "string" },
    accessories: { type: "string" },
    colors: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },
    advice: { type: "string" },
    imageKeywords: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 3,
    },
  },
  required: [
    "tops",
    "bottoms",
    "outer",
    "accessories",
    "colors",
    "advice",
    "imageKeywords",
  ],
} as const;

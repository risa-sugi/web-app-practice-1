import type { WeatherSnapshot } from "./weather";

export const SCENES = [
  "通勤",
  "デート",
  "カジュアル",
  "アウトドア",
  "フォーマル",
] as const;

export type Scene = (typeof SCENES)[number];

export function isScene(value: unknown): value is Scene {
  return typeof value === "string" && (SCENES as readonly string[]).includes(value);
}

export type OutfitProposal = {
  tops: string;
  bottoms: string;
  outer: string;
  accessories: string;
  colors: string[];
  advice: string;
  imageKeywords: string[];
};

export type OutfitResponse = {
  weather: WeatherSnapshot;
  scene: Scene;
  outfit: OutfitProposal;
};

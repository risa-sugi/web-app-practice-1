export type RegionCoords = {
  lat: number;
  lon: number;
};

export const DEFAULT_REGION = "東京";

export const REGION_COORDS: Record<string, RegionCoords> = {
  札幌: { lat: 43.0642, lon: 141.3469 },
  仙台: { lat: 38.2682, lon: 140.8694 },
  東京: { lat: 35.6895, lon: 139.6917 },
  横浜: { lat: 35.4437, lon: 139.638 },
  名古屋: { lat: 35.1815, lon: 136.9066 },
  京都: { lat: 35.0116, lon: 135.7681 },
  大阪: { lat: 34.6937, lon: 135.5023 },
  広島: { lat: 34.3853, lon: 132.4553 },
  福岡: { lat: 33.5904, lon: 130.4017 },
  那覇: { lat: 26.2124, lon: 127.6809 },
};

export const REGION_NAMES = Object.keys(REGION_COORDS);

export function resolveRegion(name: string | null | undefined): RegionCoords | null {
  if (!name) return null;
  return REGION_COORDS[name] ?? null;
}

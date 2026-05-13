import { NextResponse } from "next/server";

import { generateOutfit } from "@/lib/gemini/client";
import { fetchWeather } from "@/lib/weather/openmeteo";
import { DEFAULT_REGION, resolveRegion } from "@/lib/weather/regions";
import { isScene, type OutfitResponse } from "@/types/outfit";

type Body = {
  scene?: unknown;
  region?: unknown;
  lat?: unknown;
  lon?: unknown;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON ボディが不正です" }, { status: 400 });
  }

  if (!isScene(body.scene)) {
    return NextResponse.json(
      { error: "scene の値が不正です" },
      { status: 400 }
    );
  }
  const scene = body.scene;

  let lat: number;
  let lon: number;
  let region: string;

  if (typeof body.lat === "number" && typeof body.lon === "number") {
    lat = body.lat;
    lon = body.lon;
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return NextResponse.json(
        { error: "lat/lon の値が不正です" },
        { status: 400 }
      );
    }
    region = typeof body.region === "string" ? body.region : "現在地";
  } else {
    const targetName =
      typeof body.region === "string" && body.region.length > 0
        ? body.region
        : DEFAULT_REGION;
    const coords = resolveRegion(targetName);
    if (!coords) {
      return NextResponse.json(
        { error: `未対応の地域です: ${targetName}` },
        { status: 400 }
      );
    }
    lat = coords.lat;
    lon = coords.lon;
    region = targetName;
  }

  try {
    const weather = await fetchWeather(lat, lon, region);
    const outfit = await generateOutfit(weather, scene);
    const response: OutfitResponse = { weather, scene, outfit };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

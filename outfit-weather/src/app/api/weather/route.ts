import { NextResponse } from "next/server";

import { fetchWeather } from "@/lib/weather/openweather";
import { DEFAULT_REGION, resolveRegion } from "@/lib/weather/regions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");
  const regionParam = searchParams.get("region");

  let lat: number;
  let lon: number;
  let region: string;

  if (latParam !== null && lonParam !== null) {
    lat = Number(latParam);
    lon = Number(lonParam);
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
    region = regionParam ?? "現在地";
  } else {
    const targetName = regionParam ?? DEFAULT_REGION;
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
    const snapshot = await fetchWeather(lat, lon, region);
    return NextResponse.json(snapshot);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

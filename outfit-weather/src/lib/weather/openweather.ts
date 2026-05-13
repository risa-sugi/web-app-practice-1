import "server-only";

import type { WeatherSnapshot } from "@/types/weather";

const ONE_CALL_ENDPOINT = "https://api.openweathermap.org/data/3.0/onecall";

type OneCallWeather = {
  description: string;
  icon: string;
};

type OneCallCurrent = {
  temp: number;
  feels_like: number;
  weather: OneCallWeather[];
};

type OneCallDaily = {
  pop: number;
  temp: { min: number; max: number };
  weather: OneCallWeather[];
};

type OneCallResponse = {
  current: OneCallCurrent;
  daily: OneCallDaily[];
};

export async function fetchWeather(
  lat: number,
  lon: number,
  region: string
): Promise<WeatherSnapshot> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY が設定されていません");
  }

  const url = new URL(ONE_CALL_ENDPOINT);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");
  url.searchParams.set("lang", "ja");
  url.searchParams.set("exclude", "minutely,hourly,alerts");

  const res = await fetch(url, {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `OpenWeatherMap API error (${res.status}): ${body.slice(0, 200)}`
    );
  }

  const data = (await res.json()) as OneCallResponse;
  return normalize(data, region);
}

function normalize(data: OneCallResponse, region: string): WeatherSnapshot {
  const current = data.current;
  const today = data.daily[0];
  const tomorrow = data.daily[1] ?? data.daily[0];

  return {
    region,
    current: {
      temp: Math.round(current.temp),
      feelsLike: Math.round(current.feels_like),
      description: current.weather[0]?.description ?? "",
      iconCode: current.weather[0]?.icon ?? "",
      pop: today?.pop ?? 0,
    },
    tomorrow: {
      tempMin: Math.round(tomorrow.temp.min),
      tempMax: Math.round(tomorrow.temp.max),
      description: tomorrow.weather[0]?.description ?? "",
      iconCode: tomorrow.weather[0]?.icon ?? "",
      pop: tomorrow.pop ?? 0,
    },
  };
}

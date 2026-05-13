import "server-only";

import type { WeatherSnapshot } from "@/types/weather";

const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

type OpenMeteoResponse = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
  };
  daily: {
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
};

type WeatherInfo = { description: string; iconCode: string };

const WMO_MAP: Record<number, WeatherInfo> = {
  0: { description: "快晴", iconCode: "01d" },
  1: { description: "おおむね晴れ", iconCode: "01d" },
  2: { description: "晴れ時々曇り", iconCode: "02d" },
  3: { description: "曇り", iconCode: "04d" },
  45: { description: "霧", iconCode: "50d" },
  48: { description: "霧氷", iconCode: "50d" },
  51: { description: "霧雨（弱い）", iconCode: "09d" },
  53: { description: "霧雨", iconCode: "09d" },
  55: { description: "霧雨（強い）", iconCode: "09d" },
  56: { description: "凍る霧雨（弱い）", iconCode: "09d" },
  57: { description: "凍る霧雨（強い）", iconCode: "09d" },
  61: { description: "雨（弱い）", iconCode: "10d" },
  63: { description: "雨", iconCode: "10d" },
  65: { description: "雨（強い）", iconCode: "10d" },
  66: { description: "凍る雨（弱い）", iconCode: "13d" },
  67: { description: "凍る雨（強い）", iconCode: "13d" },
  71: { description: "雪（弱い）", iconCode: "13d" },
  73: { description: "雪", iconCode: "13d" },
  75: { description: "雪（強い）", iconCode: "13d" },
  77: { description: "霰", iconCode: "13d" },
  80: { description: "にわか雨（弱い）", iconCode: "09d" },
  81: { description: "にわか雨", iconCode: "09d" },
  82: { description: "にわか雨（強い）", iconCode: "09d" },
  85: { description: "にわか雪（弱い）", iconCode: "13d" },
  86: { description: "にわか雪", iconCode: "13d" },
  95: { description: "雷雨", iconCode: "11d" },
  96: { description: "雷雨と雹（弱い）", iconCode: "11d" },
  99: { description: "雷雨と雹（強い）", iconCode: "11d" },
};

const UNKNOWN_WEATHER: WeatherInfo = {
  description: "不明",
  iconCode: "",
};

function lookupWeather(code: number): WeatherInfo {
  return WMO_MAP[code] ?? UNKNOWN_WEATHER;
}

export async function fetchWeather(
  lat: number,
  lon: number,
  region: string
): Promise<WeatherSnapshot> {
  const url = new URL(FORECAST_ENDPOINT);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,weather_code"
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "2");

  const res = await fetch(url, {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Open-Meteo API error (${res.status}): ${body.slice(0, 200)}`
    );
  }

  const data = (await res.json()) as OpenMeteoResponse;
  return normalize(data, region);
}

function normalize(data: OpenMeteoResponse, region: string): WeatherSnapshot {
  const currentInfo = lookupWeather(data.current.weather_code);
  const todayPop = data.daily.precipitation_probability_max[0] ?? 0;
  const tomorrowInfo = lookupWeather(
    data.daily.weather_code[1] ?? data.daily.weather_code[0]
  );
  const tomorrowPop = data.daily.precipitation_probability_max[1] ?? 0;
  const tomorrowMax =
    data.daily.temperature_2m_max[1] ?? data.daily.temperature_2m_max[0];
  const tomorrowMin =
    data.daily.temperature_2m_min[1] ?? data.daily.temperature_2m_min[0];

  return {
    region,
    current: {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      description: currentInfo.description,
      iconCode: currentInfo.iconCode,
      pop: todayPop / 100,
    },
    tomorrow: {
      tempMin: Math.round(tomorrowMin),
      tempMax: Math.round(tomorrowMax),
      description: tomorrowInfo.description,
      iconCode: tomorrowInfo.iconCode,
      pop: tomorrowPop / 100,
    },
  };
}

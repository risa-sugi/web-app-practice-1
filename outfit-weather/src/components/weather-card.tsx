"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WeatherSnapshot } from "@/types/weather";

type WeatherCardProps = {
  defaultRegion: string;
};

type FetchState =
  | { status: "loading" }
  | { status: "success"; data: WeatherSnapshot }
  | { status: "error"; message: string };

export function WeatherCard({ defaultRegion }: WeatherCardProps) {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const coords = await tryGeolocation();
        const url = coords
          ? `/api/weather?lat=${coords.lat}&lon=${coords.lon}`
          : `/api/weather?region=${encodeURIComponent(defaultRegion)}`;
        const res = await fetch(url, { signal: controller.signal });
        const body = await res.json();
        if (!res.ok) {
          setState({
            status: "error",
            message: body?.error ?? "天気情報を取得できませんでした",
          });
          return;
        }
        setState({ status: "success", data: body as WeatherSnapshot });
      } catch (err) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    void load();
    return () => controller.abort();
  }, [defaultRegion]);

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>今日の天気</CardTitle>
        <CardDescription>
          {state.status === "success" ? state.data.region : defaultRegion}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.status === "loading" && <WeatherCardSkeleton />}
        {state.status === "error" && (
          <p className="text-sm text-destructive" role="alert">
            {state.message}
          </p>
        )}
        {state.status === "success" && <WeatherCardBody data={state.data} />}
      </CardContent>
    </Card>
  );
}

function WeatherCardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-20 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-12 w-3/4 animate-pulse rounded-md bg-muted" />
    </div>
  );
}

function WeatherCardBody({ data }: { data: WeatherSnapshot }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-center gap-4">
        <WeatherIcon code={data.current.iconCode} alt={data.current.description} />
        <div className="flex flex-col">
          <span className="text-4xl font-semibold">{data.current.temp}°C</span>
          <span className="text-sm text-muted-foreground">
            {data.current.description}・体感 {data.current.feelsLike}°C
          </span>
          <span className="text-xs text-muted-foreground">
            今日の降水確率: {formatPop(data.current.pop)}
          </span>
        </div>
      </section>
      <section className="border-t pt-4">
        <h3 className="text-sm font-medium">明日</h3>
        <div className="mt-2 flex items-center gap-4">
          <WeatherIcon
            code={data.tomorrow.iconCode}
            alt={data.tomorrow.description}
            size={48}
          />
          <div className="flex flex-col text-sm">
            <span>
              <span className="text-foreground font-medium">
                {data.tomorrow.tempMax}°C
              </span>
              <span className="text-muted-foreground">
                {" "}
                / {data.tomorrow.tempMin}°C
              </span>
            </span>
            <span className="text-muted-foreground">
              {data.tomorrow.description}・降水確率 {formatPop(data.tomorrow.pop)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function WeatherIcon({
  code,
  alt,
  size = 72,
}: {
  code: string;
  alt: string;
  size?: number;
}) {
  if (!code) return null;
  return (
    <Image
      src={`https://openweathermap.org/img/wn/${code}@2x.png`}
      alt={alt}
      width={size}
      height={size}
      unoptimized
    />
  );
}

function formatPop(pop: number) {
  return `${Math.round(pop * 100)}%`;
}

function tryGeolocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 600_000 }
    );
  });
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OutfitResponse, Scene } from "@/types/outfit";

type OutfitSuggestionProps = {
  scene: Scene;
  region?: string;
  lat?: number;
  lon?: number;
};

type FetchState =
  | { status: "loading" }
  | { status: "success"; data: OutfitResponse }
  | { status: "error"; message: string };

export function OutfitSuggestion({
  scene,
  region,
  lat,
  lon,
}: OutfitSuggestionProps) {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(
    async (signal: AbortSignal) => {
      try {
        const body: Record<string, unknown> = { scene };
        if (typeof lat === "number" && typeof lon === "number") {
          body.lat = lat;
          body.lon = lon;
        } else if (region) {
          body.region = region;
        }
        const res = await fetch("/api/outfit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal,
        });
        const json = await res.json();
        if (!res.ok) {
          setState({
            status: "error",
            message: json?.error ?? "コーデ提案の取得に失敗しました",
          });
          return;
        }
        setState({ status: "success", data: json as OutfitResponse });
      } catch (err) {
        if (signal.aborted) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    },
    [scene, region, lat, lon]
  );

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount/regen 起点の fetch → setState は意図したパターン
    void load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const handleRegenerate = () => {
    setState({ status: "loading" });
    setReloadKey((k) => k + 1);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>コーディネート提案</CardTitle>
        <CardDescription>
          {state.status === "success"
            ? `${state.data.weather.region} / シーン: ${state.data.scene}`
            : `シーン: ${scene}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {state.status === "loading" && <OutfitSkeleton />}
        {state.status === "error" && (
          <p className="text-sm text-destructive" role="alert">
            {state.message}
          </p>
        )}
        {state.status === "success" && <OutfitBody data={state.data} />}
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={handleRegenerate}
            disabled={state.status === "loading"}
          >
            別のコーデを見る
          </Button>
          <Button asChild variant="outline">
            <Link href="/">ホームに戻る</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OutfitSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        <span className="inline-block animate-pulse">AI が考えています</span>
        <span className="ml-1 inline-block animate-pulse">...</span>
      </p>
      <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted" />
      <div className="h-20 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-20 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-12 w-2/3 animate-pulse rounded-md bg-muted" />
    </div>
  );
}

function OutfitBody({ data }: { data: OutfitResponse }) {
  const { weather, outfit } = data;
  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-center gap-4 rounded-md border bg-muted/30 p-4">
        {weather.current.iconCode && (
          <Image
            src={`https://openweathermap.org/img/wn/${weather.current.iconCode}@2x.png`}
            alt={weather.current.description}
            width={56}
            height={56}
            unoptimized
          />
        )}
        <div className="text-sm">
          <p className="font-medium">
            {weather.current.temp}°C・{weather.current.description}
          </p>
          <p className="text-muted-foreground">
            体感 {weather.current.feelsLike}°C / 降水確率{" "}
            {Math.round(weather.current.pop * 100)}%
          </p>
        </div>
      </section>
      <section className="grid gap-3 text-sm md:grid-cols-2">
        <OutfitItem label="トップス" value={outfit.tops} />
        <OutfitItem label="ボトムス" value={outfit.bottoms} />
        <OutfitItem label="アウター" value={outfit.outer} />
        <OutfitItem label="小物" value={outfit.accessories} />
      </section>
      <section>
        <h3 className="text-sm font-medium">おすすめカラー</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {outfit.colors.map((color) => (
            <ColorChip key={color} color={color} />
          ))}
        </div>
      </section>
      <section className="rounded-md border-l-4 border-primary bg-primary/5 p-3 text-sm">
        <p className="font-medium">ワンポイント</p>
        <p className="mt-1 text-muted-foreground">{outfit.advice}</p>
      </section>
    </div>
  );
}

function OutfitItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function ColorChip({ color }: { color: string }) {
  const isHex = /^#[0-9a-fA-F]{6}$/.test(color);
  return (
    <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
      <span
        className="h-4 w-4 rounded-full border"
        style={isHex ? { backgroundColor: color } : undefined}
      />
      <span className="font-mono">{color}</span>
    </div>
  );
}

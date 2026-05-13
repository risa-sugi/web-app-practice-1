"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SCENES, type Scene } from "@/types/outfit";

import type { ResolvedLocation } from "./home-content";

type SceneSelectorProps = {
  defaultRegion: string;
  location: ResolvedLocation;
};

export function SceneSelector({ defaultRegion, location }: SceneSelectorProps) {
  const [selected, setSelected] = useState<Scene | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = () => {
    if (!selected) return;
    const params = new URLSearchParams();
    params.set("scene", selected);
    if (location.kind === "coords") {
      params.set("lat", String(location.lat));
      params.set("lon", String(location.lon));
    } else {
      params.set("region", location.region);
    }
    startTransition(() => {
      router.push(`/outfit?${params.toString()}`);
    });
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>シーンを選ぶ</CardTitle>
        <CardDescription>
          基準: {location.kind === "coords" ? "現在地" : location.region}
          {location.kind === "region" && location.region !== defaultRegion
            ? ` (設定: ${defaultRegion})`
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {SCENES.map((scene) => (
            <button
              key={scene}
              type="button"
              onClick={() => setSelected(scene)}
              className={
                "rounded-full border px-4 py-1.5 text-sm transition-colors " +
                (selected === scene
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-input")
              }
            >
              {scene}
            </button>
          ))}
        </div>
        <Button onClick={handleSubmit} disabled={!selected || pending}>
          {pending ? "ページ遷移中..." : "コーデを提案してもらう"}
        </Button>
      </CardContent>
    </Card>
  );
}

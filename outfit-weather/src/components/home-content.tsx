"use client";

import { useCallback, useState } from "react";

import { SceneSelector } from "@/components/scene-selector";
import { WeatherCard } from "@/components/weather-card";

export type ResolvedLocation =
  | { kind: "coords"; lat: number; lon: number }
  | { kind: "region"; region: string };

type HomeContentProps = {
  defaultRegion: string;
};

export function HomeContent({ defaultRegion }: HomeContentProps) {
  const [location, setLocation] = useState<ResolvedLocation>({
    kind: "region",
    region: defaultRegion,
  });

  const handleResolved = useCallback((loc: ResolvedLocation) => {
    setLocation(loc);
  }, []);

  return (
    <>
      <WeatherCard defaultRegion={defaultRegion} onResolved={handleResolved} />
      <SceneSelector defaultRegion={defaultRegion} location={location} />
    </>
  );
}

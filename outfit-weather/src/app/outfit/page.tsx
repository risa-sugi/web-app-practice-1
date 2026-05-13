import { redirect } from "next/navigation";

import { OutfitSuggestion } from "@/components/outfit-suggestion";
import { createClient } from "@/lib/supabase/server";
import { isScene } from "@/types/outfit";

type SearchParams = Record<string, string | string[] | undefined>;

function pickString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function OutfitPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const scene = pickString(params.scene);
  if (!isScene(scene)) {
    redirect("/");
  }

  const region = pickString(params.region);
  const latRaw = pickString(params.lat);
  const lonRaw = pickString(params.lon);
  const lat = latRaw ? Number(latRaw) : undefined;
  const lon = lonRaw ? Number(lonRaw) : undefined;
  const useCoords =
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lon === "number" &&
    Number.isFinite(lon);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-8">
      <OutfitSuggestion
        scene={scene}
        region={useCoords ? undefined : region}
        lat={useCoords ? lat : undefined}
        lon={useCoords ? lon : undefined}
      />
    </main>
  );
}

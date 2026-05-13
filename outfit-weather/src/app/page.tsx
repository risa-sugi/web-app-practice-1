import { redirect } from "next/navigation";

import { WeatherCard } from "@/components/weather-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEFAULT_REGION } from "@/lib/weather/regions";
import { createClient } from "@/lib/supabase/server";

import { logout } from "./login/actions";

function extractUsername(email: string | null | undefined) {
  if (!email) return "";
  const at = email.indexOf("@");
  return at >= 0 ? email.slice(0, at) : email;
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("region")
    .maybeSingle();

  const region = settings?.region ?? DEFAULT_REGION;
  const username = extractUsername(user.email);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-8">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>outfit-weather</CardTitle>
          <CardDescription>
            天気とシーンに合ったコーディネートを AI が提案するアプリ（開発中）
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
          <p>
            ログイン中:{" "}
            <span className="text-foreground font-medium">{username}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <Button disabled>コーデを提案してもらう（Day 8-10 で実装）</Button>
            <form action={logout}>
              <Button type="submit" variant="outline">
                ログアウト
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
      <WeatherCard defaultRegion={region} />
    </main>
  );
}

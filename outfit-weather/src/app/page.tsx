import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { logout } from "./login/actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-8">
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
            <span className="text-foreground font-medium">{user.email}</span>
          </p>
          <p>Day 3-4 認証実装完了。Day 5-7 で天気APIを実装していきます。</p>
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
    </main>
  );
}

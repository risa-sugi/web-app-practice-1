import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
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
            Day 1-2 セットアップ完了。Day 3 以降で認証・天気API・AI提案を実装していきます。
          </p>
          <div>
            <Button disabled>コーデを提案してもらう（Day 8-10 で実装）</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

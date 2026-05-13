"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { authenticate, type AuthState } from "./actions";

type Mode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    authenticate,
    undefined
  );

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === "login" ? "ログイン" : "新規登録"}</CardTitle>
          <CardDescription>
            {mode === "login"
              ? "ユーザーIDとパスワードでログインしてください"
              : "ユーザーIDとパスワードでアカウントを作成します"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="mode" value={mode} />
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-sm font-medium">
                ユーザーID
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                minLength={3}
                maxLength={32}
                pattern="[a-z0-9_\-]{3,32}"
                autoComplete="username"
                placeholder="your_id"
              />
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">
                  半角英小文字・数字・ハイフン・アンダースコア 3〜32文字
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                パスワード
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">6文字以上</p>
              )}
            </div>
            {state?.error && (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending
                ? "送信中..."
                : mode === "login"
                  ? "ログイン"
                  : "新規登録"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              className="text-primary underline-offset-4 hover:underline"
              onClick={() =>
                setMode((m) => (m === "login" ? "signup" : "login"))
              }
            >
              {mode === "login"
                ? "アカウントをお持ちでない方は新規登録"
                : "すでにアカウントをお持ちの方はログイン"}
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

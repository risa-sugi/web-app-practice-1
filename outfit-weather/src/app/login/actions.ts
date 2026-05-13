"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string } | undefined;

const USERNAME_PATTERN = /^[a-z0-9_-]{3,32}$/;
const SYNTHETIC_EMAIL_DOMAIN = "users.outfit-weather.local";

function toSyntheticEmail(username: string) {
  return `${username}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return "ユーザーIDまたはパスワードが違います";
  }
  if (/already registered|already exists/i.test(message)) {
    return "このユーザーIDはすでに使われています";
  }
  if (/password.*(weak|short)/i.test(message)) {
    return "パスワードが弱すぎます。6文字以上で別の文字列を試してください";
  }
  return message;
}

export async function authenticate(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const mode = formData.get("mode") === "signup" ? "signup" : "login";
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "ユーザーIDとパスワードを入力してください" };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return {
      error:
        "ユーザーIDは半角英小文字・数字・ハイフン・アンダースコアの3〜32文字で入力してください",
    };
  }
  if (password.length < 6) {
    return { error: "パスワードは6文字以上で入力してください" };
  }

  const supabase = await createClient();
  const email = toSyntheticEmail(username);

  if (mode === "signup") {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: translateAuthError(error.message) };
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: translateAuthError(error.message) };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

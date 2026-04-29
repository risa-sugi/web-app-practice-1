"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string } | undefined;

export async function authenticate(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const mode = formData.get("mode") === "signup" ? "signup" : "login";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }
  if (password.length < 6) {
    return { error: "パスワードは6文字以上で入力してください" };
  }

  const supabase = await createClient();

  if (mode === "signup") {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

# Supabase プロジェクトセットアップ

## 概要
Supabase プロジェクトを新規作成し、Next.js から接続するために必要な情報を取得して `.env.local` に反映するまでの手順。
2026年4月時点の新UIに準拠（`Settings` が `Data API` と `API Keys` に分割された後の構成）。

## 1. アカウント準備
1. https://supabase.com/dashboard を開く
2. **Sign in with GitHub**（既存の GitHub アカウントを使うのが一番楽）
3. 初回は組織（Organization）が自動作成される

## 2. プロジェクト作成
ダッシュボードの右上 **New project** をクリック。

| 項目 | 設定 |
|---|---|
| Organization | 自分の個人 org |
| Project name | わかりやすい名前（例: `outfit-weather`） |
| Database Password | **Generate a password** で自動生成 → パスワードマネージャに保存 |
| Region | **Northeast Asia (Tokyo)** ← 国内利用ならレイテンシ最小 |
| Pricing Plan | **Free** |

### Security 設定（同じフォーム内）

| 項目 | 推奨 | 理由 |
|---|---|---|
| Enable Data API | ✅ ON | `@supabase/ssr` 経由でDBを叩くため必須 |
| Automatically expose new tables and functions | ✅ ON | MVP段階では1テーブルしか作らないので楽 |
| **Enable automatic RLS** | ✅ **ON** | RLS かけ忘れ事故の保険として必ず ON |

特に **Enable automatic RLS** は重要。これを OFF のままテーブルを作ると、デフォルトで誰でも全行読める状態になる。後から手動で policy を書く前提なら ON にしておくと事故防止になる。

最後に **Create new project** → プロビジョニングに 1〜2分待つ。

## 3. URL と API Key を取得（2026年新UI）

旧 UI は1つの「API」ページにまとまっていたが、現在は **Data API** と **API Keys** に分割されている。

### 3-1. Project URL
1. 左サイドバーの ⚙️ **Project Settings** をクリック
2. CONFIGURATION 直下の **General** ではなく、INTEGRATIONS セクションの **Data API** を開く
3. **Project URL** の📋ボタンでコピー
   - 形式: `https://<project-ref>.supabase.co`

### 3-2. anon key（新UI: publishable key）
1. 同じ Settings の CONFIGURATION セクションの **API Keys** を開く
2. タブが2つある：
   - **Publishable and secret API keys**（新フォーマット） ← こちらを使う
   - **Legacy anon, service_role API keys**（旧フォーマット） ← 当面は使わなくてOK
3. **Publishable key** セクションの `default` 行、`sb_publishable_...` の📋ボタンでコピー

### 3-3. ⚠️ 絶対に取得してはいけないキー
- **Secret keys** セクションの `sb_secret_...`
- 旧フォーマットの **service_role** キー

これらは管理者権限。`NEXT_PUBLIC_*` でフロントに渡したら**全データ操作可能**になる事故キー。

## 4. キー形式の整理

### 新フォーマット（2025年8月以降）

| ラベル | 用途 | 例 |
|---|---|---|
| `Publishable` | 公開して良いキー（旧 anon 相当） | `sb_publishable_...` |
| `Secret` | サーバ側専用（旧 service_role 相当） | `sb_secret_...` |

### 旧フォーマット（Legacy）

| ラベル | 例 |
|---|---|
| `anon` `public` | `eyJhbGci...`（JWT） |
| `service_role` `secret` | `eyJhbGci...`（JWT） |

`@supabase/ssr ^0.10` は新旧どちらも受け付けるので、コード側の変更は不要。新規プロジェクトなら新フォーマットを使えばOK。

## 5. `.env.local` への反映

`outfit-weather/.env.local` を開いて：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> 環境変数名は `NEXT_PUBLIC_SUPABASE_ANON_KEY` のままでOK。中身が新フォーマットでも `@supabase/ssr` は読み分けてくれる。

書式の注意（[004-windows-local-setup.md](./004-windows-local-setup.md) の §5 にも記載）：
- `=` の前後にスペースなし
- 値をクォートで囲まない
- 末尾に余計なスペース・改行を入れない

## 6. 動作確認
```powershell
cd outfit-weather
npm run dev
```
ブラウザで http://localhost:3000 → ホーム画面が表示されればOK。
この時点では認証画面はまだ無いので、Supabase に実際に通信するのは Day 3-4 以降。

## やってはいけないこと

| やらかし | 結果 |
|---|---|
| `service_role` / `Secret` を `NEXT_PUBLIC_*` に貼る | 全データ漏洩（即流出案件） |
| `.env.local` を git add | キーが GitHub に残る（履歴改変も必要に） |
| RLS なしでテーブルを公開 | 誰でも全行読み書き可能 |
| Database Password を平文で `.env.local` に書く | 平文保管。MVP では DB 直接接続しないので不要 |

事故った時：
1. Supabase ダッシュボードで該当キーを **Rotate**（無効化＋再発行）
2. GitHub に残った場合は履歴ごと削除（`git filter-repo` 等）
3. ログを確認して不審なアクセスがないか調査

## DB スキーマの作成（Day 3-4 以降）
`docs/decisions/003-screen-db-design.md` の `user_settings` テーブルを SQL Editor で作成し、RLS policy を貼る。具体的な SQL は Day 3-4 の作業で扱う。

## 関連
- [004-windows-local-setup.md](./004-windows-local-setup.md) — `.env.local` の作成・配置
- [../decisions/002-tech-stack.md](../decisions/002-tech-stack.md) — Supabase を選定した理由
- [../decisions/003-screen-db-design.md](../decisions/003-screen-db-design.md) — DB 設計

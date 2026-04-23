# プロジェクト概要
天気×AIコーディネート提案Webアプリ。今日の天気とシーン（通勤・デート・カジュアル等）に応じて、AIがおすすめの服装とおすすめカラー、参考コーデ画像を提案する。

## リポジトリ構成
- `outfit-weather/` — Next.js アプリ本体（ここが作業の中心）
- `docs/decisions/` — 技術選定・仕様判断の記録（ADR）
- `docs/tips/` — 開発Tips
- `docs/release/` — リリースノート
- `docs/troubleshooting/` — トラブルシューティング

**作業時は `outfit-weather/` 配下で `npm run dev` / `npm run build` / `npm run lint` を実行する。** ルート直下にアプリコードは置かない。

## 技術スタック
- Next.js 16（App Router / TypeScript / src ディレクトリ）
- Supabase（Auth + PostgreSQL）: `@supabase/ssr` 経由
- Tailwind CSS v4 + shadcn/ui（New York / neutral）
- Google Gemini 2.5 Flash（Day 8-10 で導入）
- OpenWeatherMap One Call API 3.0（Day 5-7 で導入）
- Unsplash API（Day 11-13 で導入）
- Vercel でホスティング（Day 22-23 で導入）

## ディレクトリ構成方針
- `outfit-weather/src/app/` — ページ（App Router）と Route Handler
- `outfit-weather/src/components/ui/` — shadcn/ui コンポーネント
- `outfit-weather/src/components/` — 独自コンポーネント
- `outfit-weather/src/lib/` — ユーティリティ、API クライアント（Supabase など）
- `outfit-weather/src/types/` — TypeScript 型定義（`Database` 型など）

## コーディング規約
- 関数コンポーネント + hooks。クラスコンポーネントは使わない
- API キーは環境変数から取得。実キーは `.env.local`（git 管理外）に、テンプレは `.env.local.example` に
- 外部API（OpenWeatherMap / Gemini / Unsplash）の呼び出しは必ず Route Handler 経由。クライアントに API キーを露出させない
- Supabase Auth のセッションは `@supabase/ssr` の `createServerClient` / `createBrowserClient` を介して読む（`src/lib/supabase/` 参照）
- エラーハンドリングを省略しない。ただし MVP 段階では過剰な抽象化は避ける

## 設計ドキュメント（必ず参照）
- `docs/decisions/001-mvp-scope.md` — MVP機能範囲
- `docs/decisions/002-tech-stack.md` — 技術スタック選定の理由
- `docs/decisions/003-screen-db-design.md` — 画面・DB 設計
- `docs/decisions/004-implementation-roadmap.md` — 4週間の実装ロードマップ

新機能を実装するときはまずこれらを確認し、ロードマップの該当Dayのスコープを越えないようにする。

## 開発方針
- MVP優先。過剰設計を避ける
- 1ヶ月でのリリースを優先し、v2候補（パーソナルカラー、履歴保存、SNSシェア等）は今はやらない
- 全サービスを無料枠内で運用する
- 壁打ち内容や学びは `docs/` にナレッジ化する

## Next.js 16 の注意
`outfit-weather/AGENTS.md` と `outfit-weather/node_modules/next/dist/docs/` に Next.js 16 のバージョン固有情報がある。バージョン依存の挙動（`cookies()` の async 化、Cache API など）はそちらを参照。

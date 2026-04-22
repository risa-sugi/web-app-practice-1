# 004: 実装ロードマップ

## 日付
2026-04-22

## 全体スケジュール（4週間）

### Week 1：土台づくり（環境構築 + 認証 + 天気表示）
- [ ] Day 1-2: プロジェクトセットアップ
  - Next.js プロジェクト作成（TypeScript / App Router）
  - Tailwind CSS + shadcn/ui 導入
  - Supabase プロジェクト作成・接続
  - 環境変数の整理（.env.local）
  - GitHubリポジトリとの連携
- [ ] Day 3-4: 認証機能
  - Supabase Auth でログイン / 新規登録画面
  - 認証ガード（未ログイン時のリダイレクト）
  - user_settings テーブル作成 + RLS設定
- [ ] Day 5-7: 天気API連携
  - OpenWeatherMap API キー取得・設定
  - Next.js Route Handler で天気データ取得API作成
  - ホーム画面の天気カードUI実装
  - 位置情報取得 or 地域手動選択の実装

### Week 2：コア機能（AI提案 + 画像表示）
- [ ] Day 8-10: Gemini API連携
  - Google AI Studio でAPIキー取得
  - Next.js Route Handler でGemini呼び出しAPI作成
  - プロンプト設計・テスト（構造化JSON出力）
  - コーデ提案画面のUI実装
- [ ] Day 11-13: Unsplash連携 + 結合
  - Unsplash APIキー取得・設定
  - AI提案のキーワードで画像検索する仕組み
  - 参考コーデ画像の表示UI
  - 再生成（別パターン）ボタン実装
- [ ] Day 14: エンドツーエンド結合
  - ホーム → 提案結果の一連のフローを通しで動作確認
  - シーン切り替えの動作確認

### Week 3：設定 + レスポンシブ + エラー処理
- [ ] Day 15-16: 設定画面
  - 地域設定の変更・保存（Supabase連携）
  - ログアウト機能
- [ ] Day 17-18: レスポンシブ対応
  - スマホ表示の調整
  - PC表示の調整（最大幅、レイアウト）
- [ ] Day 19-21: エラー処理 + UX改善
  - API エラー時のフォールバック表示
  - ローディング状態（スケルトン / スピナー）
  - APIレート制限への対応
  - 空状態の表示

### Week 4：デプロイ + 仕上げ + リリース
- [ ] Day 22-23: Vercelデプロイ
  - Vercelプロジェクト作成・GitHub連携
  - 環境変数の設定（本番用APIキー）
  - 本番環境での動作確認
- [ ] Day 24-25: テスト + バグ修正
  - 主要フローの手動テスト
  - スマホ実機での確認
  - バグ修正
- [ ] Day 26-27: 最終仕上げ
  - OGP / favicon設定
  - ページタイトル・メタ情報
  - 利用規約・プライバシーポリシー（簡易版）
- [ ] Day 28: リリース
  - 本番デプロイ
  - docs/release にリリースノート作成

---

## Claude Code での進め方

### 基本ワークフロー
1. このロードマップの各タスクを1つずつClaude Codeに依頼する
2. 「Day 1-2のセットアップをやってほしい」のように伝えればOK
3. 生成されたコードは必ず動作確認してからコミットする

### Claude Code に伝えると効果的な情報
- 今のディレクトリ構成（`tree` コマンドの結果を貼る）
- 直前に作ったファイル・変更したファイル
- エラーメッセージ（出た場合はそのまま貼る）
- このリポジトリの docs/decisions にある設計ドキュメント

### 依頼のコツ
- 1回の依頼は1機能 or 1画面に絞る（大きすぎると精度が下がる）
- 「〇〇画面を作って」より「〇〇画面のUIをこの仕様で作って。APIはモックでOK」の方が良い結果が出る
- まずUIを作り、次にAPI連携、最後にエラー処理の順で進める
- 設計ドキュメント（003-screen-db-design.md）を参照させると一貫性が保てる

### プロジェクト初期化の具体的なコマンド
```bash
# Next.js プロジェクト作成
npx create-next-app@latest outfit-weather --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# shadcn/ui 初期化
cd outfit-weather
npx shadcn@latest init

# 必要なパッケージ
npm install @supabase/supabase-js @supabase/ssr
npm install @google/generative-ai
npm install unsplash-js
npm install recharts  # v2でダッシュボード追加時に使用

# shadcn/ui コンポーネント追加（必要に応じて）
npx shadcn@latest add button card input select
```

---

## 最初の一歩
まずはDay 1のプロジェクトセットアップから。
Claude Code に以下のように伝えるとスムーズです：

「Next.js + TypeScript + Tailwind のプロジェクトを作成して、
Supabase と接続する初期設定をしてほしい。
App Router を使い、src/ ディレクトリ構成にしてください。
環境変数のテンプレート（.env.local.example）も作ってください。」

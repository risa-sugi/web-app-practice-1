# Claude Code 活用Tips

## 事前準備

### 1. Claude Code のインストール
```bash
npm install -g @anthropic-ai/claude-code
```
※ Node.js 18以上が必要

### 2. プロジェクトディレクトリで起動
```bash
cd outfit-weather
claude
```

### 3. CLAUDE.md を作成しておく
プロジェクトルートに `CLAUDE.md` を置くと、Claude Code が毎回読み込んで文脈を理解してくれる。
以下の内容を書いておくと効果的：

```markdown
# プロジェクト概要
天気×AIコーディネート提案Webアプリ

## 技術スタック
- Next.js 15 (App Router / TypeScript)
- Supabase (Auth + PostgreSQL)
- Tailwind CSS + shadcn/ui
- Google Gemini 2.5 Flash
- OpenWeatherMap API
- Unsplash API

## ディレクトリ構成方針
- src/app/ — ページ（App Router）
- src/components/ — UIコンポーネント
- src/lib/ — ユーティリティ、API クライアント
- src/types/ — TypeScript 型定義

## コーディング規約
- 関数コンポーネント + hooks を使用
- API キーは環境変数から取得（.env.local）
- 外部API呼び出しは必ず Route Handler 経由
- エラーハンドリングを省略しない

## 設計ドキュメント
docs/decisions/ 配下のファイルを参照
```

---

## 効果的な依頼パターン

### パターン1：画面を作るとき
```
ホーム画面を作ってください。
仕様は docs/decisions/003-screen-db-design.md の「ホーム画面」を参照。
まずはモックデータで動くUIだけ作ってください。API連携は次のステップでやります。
```

### パターン2：API連携するとき
```
OpenWeatherMap API と連携して天気データを取得する Route Handler を作ってください。
- エンドポイント: /api/weather
- 緯度・経度をクエリパラメータで受け取る
- レスポンスは { temp, feels_like, weather, humidity, rain_probability, hourly } の形式
- エラーハンドリングも入れてください
```

### パターン3：既存コードを修正するとき
```
src/app/api/weather/route.ts を修正してください。
現在のエラー：[エラーメッセージをそのまま貼る]
期待する動作：[正しい動作を説明]
```

### パターン4：レビューを頼むとき
```
src/app/page.tsx をレビューしてください。
観点：
- セキュリティ上の問題がないか
- TypeScriptの型が適切か
- パフォーマンスの問題がないか
```

---

## よくあるトラブルと対処

### 「ファイルが大きすぎて一度に生成できない」
→ 「まず〇〇の部分だけ作って」と分割して依頼する

### 「前のコードと矛盾する変更が入った」
→ CLAUDE.md にプロジェクトの方針を書いておく
→ 「既存の src/lib/supabase.ts を壊さないように」と明示する

### 「API キーがクライアントに露出した」
→ Route Handler（src/app/api/）経由に変更する
→ 環境変数は NEXT_PUBLIC_ プレフィックスを付けない

### 「Supabase の型が合わない」
→ `npx supabase gen types typescript` で型を自動生成する

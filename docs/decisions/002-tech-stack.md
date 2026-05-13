# 002: 技術スタックの決定

## 日付
2026-04-22

## 背景
- テーマ：天気×AIコーディネート提案アプリ
- 開発者のスキル：Java（バックエンド）+ JavaScript（フロントエンド）
- 目標：1ヶ月でMVPリリース
- 要件：スマホ・PC両対応、将来マルチユーザー、完全無料運用
- 外部API：天気API、AI API、画像API を利用

## 結論

| レイヤー | 技術 | 無料枠 |
|---|---|---|
| Frontend + API | Next.js（App Router / TypeScript） | Vercel無料枠 |
| Database | Supabase PostgreSQL | 500MB / 2プロジェクト |
| 認証 | Supabase Auth | 月5万MAU |
| UIライブラリ | shadcn/ui + Tailwind CSS | OSS |
| 天気API | Open-Meteo Forecast API | 10,000コール/日（登録不要） |
| AI API | Google Gemini 2.5 Flash | 250リクエスト/日、10RPM |
| 画像API | Unsplash API | 50リクエスト/時間 |
| デプロイ | Vercel | 月100GB帯域 |

運用コスト：月額0円

## 各APIの選定理由

### 天気：Open-Meteo Forecast API
- 登録不要・API キー不要で叩ける
- 非商用利用なら 10,000 コール/日まで無料
- 1回の呼び出しで現在天気・日別予報を取得可能
- レスポンスは WMO 天気コード（0-99）。日本語のテキスト表現とアイコンはコード側でマッピング

#### 不採用にした案: OpenWeatherMap One Call API 3.0
- 無料枠 1,000 コール/日と十分だが、サブスクライブにクレジットカード登録が必要
- 個人開発の MVP でカード登録の心理的コストを避けるため Open-Meteo に変更

### AI：Google Gemini 2.5 Flash
- 無料枠：10RPM、250リクエスト/日（クレジットカード不要）
- コーデ提案のテキスト生成に十分な性能
- 注意：無料枠では入出力データがGoogleの品質改善に使用される可能性あり
- 代替候補：Gemini 2.5 Flash-Lite（15RPM、1,000RPD、より軽量）

### 画像：Unsplash API
- 50リクエスト/時間の無料枠
- 高品質なファッション・コーデ写真が豊富
- 帰属表示（クレジット）が必要

## 不採用にした案

### 天気API: WeatherAPI.com
- 無料枠は十分だが、メアド登録が必要。登録すら不要な Open-Meteo を優先した

### AI: OpenAI GPT
- 無料クレジットが限定的で、継続利用には課金が必要

### AI: ルールベース（AIなし）
- 実装は簡単だが、提案のバリエーションが限定的で面白みに欠ける
- 「AIを使った開発」を経験したいという動機と合わない

## API キー管理
- すべてのAPIキーは環境変数で管理（.env.local）
- Next.js の Route Handler 経由でAPIを呼び出し、クライアントにキーを露出させない
- Vercel の Environment Variables に本番用キーを設定

## 今後の再利用ポイント
- Gemini + Next.js Route Handler のパターンは他のAIアプリにも転用可能
- 無料枠の上限に達した場合、Gemini 2.5 Flash-Lite への切り替えで対応できる

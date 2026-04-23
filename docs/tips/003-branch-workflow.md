# ブランチ運用ルール

## 方針
個人開発のMVPなので厳密なレビューフローは組まない。ただし、
- `main` は常にデプロイ可能な状態を保つ（Day 22-23 で Vercel が main を本番として使う）
- 動く単位で履歴が残るようにする
- 壊した Day のブランチだけ revert できるようにする

この3点を守るため、**Day 単位で feature branch を切って main にマージする**運用にする。

## ブランチ構造

```
main ──●─────────●─────────●─────────●────→
        ↑         ↑         ↑         ↑
     Day1-2    Day3-4     Day5-7   Day8-10
```

- `main` 直接 commit はしない
- Day ごと（または機能単位）にブランチを作り、完了したら PR で main にマージ

## ブランチ命名

Claude Code に依頼する場合は自動で以下のパターンのブランチ名になる:

```
claude/implement-roadmap-day<N-M>-<random>
```

自分で切る場合は内容ベースでも可:

```
feat/day3-auth
feat/day5-weather-api
fix/login-redirect
docs/release-notes
```

## 1 Day 分のワークフロー

### 1. 作業開始
main 最新から新しいブランチを切る。

```bash
git checkout main
git pull origin main
git checkout -b feat/day3-auth
```

Claude Code に依頼するときは「Day 3-4 の認証機能をやってほしい」と伝えるだけでOK（ブランチは自動で切られる）。

### 2. 作業・コミット
- コミットメッセージは [`002-commit-convention.md`](./002-commit-convention.md) に従う
- 1つのDayで複数コミットになってOK（細かく区切ったほうが後で読みやすい）
- コミットごとに `npm run build` / `npm run lint` が通る状態を維持

### 3. push
```bash
git push -u origin feat/day3-auth
```

### 4. PR 作成
GitHub で PR を作る。タイトルと本文の例:

```
タイトル: Day 3-4: Supabase Auth でログイン/新規登録を実装

本文:
## 概要
- ログイン / 新規登録画面（Supabase Auth）
- 認証ガード（未ログイン時は /login へリダイレクト）
- user_settings テーブル作成 + RLS 設定

## 動作確認
- [x] 新規登録 → ホームに遷移
- [x] ログアウト → /login にリダイレクト
- [x] 未ログインでホームにアクセス → /login にリダイレクト

## ロードマップ該当
`docs/decisions/004-implementation-roadmap.md` の Day 3-4
```

### 5. セルフレビュー
ブラウザで PR の "Files changed" タブを開いて diff を眺める:

- 不要なデバッグコード (`console.log`) が残っていないか
- API キーがハードコードされていないか
- 意図しないファイル（`.env.local`, `node_modules/` など）が含まれていないか

ポイントは**他人のコードとして眺める**こと。個人開発だと「自分で書いたから大丈夫」バイアスが効きやすいので、PR の diff ビューで機械的にチェックする方が漏れが少ない。

### 6. main にマージ
GitHub の PR 画面で緑の **Merge** ボタンを押す。

マージ方法の使い分け:

| 方法 | 使いどころ |
|---|---|
| **Squash and merge** | Day 内のコミットが細かすぎる / WIP コミットが混ざっている時 |
| **Create a merge commit** | Day 内の各コミットを履歴に残したい時（今回の Day 1-2 のようにキレイな分け方をしている時） |
| **Rebase and merge** | 使わない（履歴の再編が面倒なわりにメリット小） |

**このプロジェクトのデフォルトは "Create a merge commit"** にする。理由: Day ごとの区切りを main の履歴にも残したいため。

### 7. ローカル側の後片付け

```bash
git checkout main
git pull origin main         # マージ結果を取り込む
git branch -d feat/day3-auth # ローカルのブランチは削除
```

リモートのブランチは PR マージ時に GitHub 側で自動削除される設定にしておくとよい（リポジトリ Settings → General → "Automatically delete head branches"）。

## 例外ルール

### hotfix
本番運用後（Day 28以降）にバグを踏んだ場合:
1. main から `fix/xxx` ブランチを切る
2. 修正して PR
3. セルフマージ

### 大きめの実験
Day の途中で「別アプローチも試してみたい」時は、その Day のブランチからさらに分岐してOK。実験が成功したらマージ、ダメなら捨てる。

```
main ──●───────────●────→
        ↓         ↑
        feat/day5-weather-api
              ↓           ↑
              experiment/day5-wttr-in  (← ダメだったら捨てる)
```

## Claude Code に依頼するときの定型文

```
Day <N-M> の <機能名> を実装してください。
仕様は docs/decisions/004-implementation-roadmap.md と
関連する docs/decisions/*.md を参照。
コミットは docs/tips/002-commit-convention.md、
ブランチ運用は docs/tips/003-branch-workflow.md に従ってください。
```

## やらないこと
- **ブランチ保護ルール** — 個人開発なので main への直push禁止まではやらない（ただし自主的に守る）
- **レビュアー必須のPR** — セルフマージで十分
- **CI/CDの強制** — Day 22-23 で Vercel が自動ビルドするので、それが通れば十分

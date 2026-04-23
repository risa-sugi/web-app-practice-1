# Windows ローカル開発環境セットアップ

## 対象
- Windows 10 / 11 で開発するケース
- 初回セットアップ時に踏みやすいハマりポイントをまとめる

Mac / Linux の場合は基本コマンドが通るので、本書の「ハマりやすいポイント」だけ参考にすればよい。

## 必要なツール

| ツール | 用途 | バージョン |
|---|---|---|
| Node.js | Next.js / npm の実行 | LTS（v20以降） |
| Git for Windows | リポジトリ操作 | 最新 |
| Claude Code | AI 開発支援 | 最新 |
| エディタ | コード編集 | VS Code 推奨 |

## 1. Node.js
1. https://nodejs.org/ja から **LTS** 版をDL
2. インストーラを起動、デフォルト設定で進める
3. 「Automatically install the necessary tools」のチェックは**外してOK**
   - これは Visual Studio Build Tools をついでに入れる機能
   - 今回のスタック（Next.js / Supabase / Gemini SDK / Unsplash）は全部 pure JS なので不要
   - ネイティブモジュールが必要になったら別途 https://visualstudio.microsoft.com/ja/visual-cpp-build-tools/ から入れる

### 確認
PowerShell を**新規**に開いて：
```powershell
node -v
npm -v
```
バージョンが出ればOK。出なければ PowerShell を閉じて開き直す（PATHの反映待ち）。

## 2. Git for Windows
1. https://git-scm.com/download/win から DL
2. インストーラを起動、ほぼ Next 連打でOK
3. 注意する2画面：
   - **Choosing the default editor**: VS Code 入れているなら "Use Visual Studio Code"、迷ったら "Use Notepad"
   - **Adjusting the name of the initial branch**: "Override the default branch name" を選んで `main` を入力（GitHub と揃える）
4. インストール完了後、PowerShell を閉じて開き直す

### 確認
```powershell
git --version
```

## 3. Claude Code

### 3-1. PowerShell ExecutionPolicy を緩める
Windows のデフォルトでは PowerShell スクリプトが全部ブロックされており、`npm install -g` 系で失敗する。

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
- `Y` を選んで Enter
- 管理者権限不要（CurrentUser スコープなので自分のユーザーのみに影響）
- セキュリティ的にも妥当（ローカルスクリプトのみ実行可、ネット由来は署名必須）

### 3-2. インストール
```powershell
npm install -g @anthropic-ai/claude-code
```
権限エラー（`EACCES`）が出たら PowerShell を**管理者として実行**で開き直して再試行。

### 3-3. 確認
```powershell
claude --version
```

### 3-4. 初回認証
リポジトリのルートで `claude` を実行 → ブラウザが自動で開く → ログイン → 認可 → ターミナルに `>` プロンプトが出れば完了。

## 4. リポジトリのクローン

### 4-1. クローン先の選び方
**`C:\Users\<ユーザー名>\repos\` 推奨**。理由：

| 場所 | 良し悪し |
|---|---|
| `C:\Users\<user>\repos\` | ✅ 短いパス、OneDrive 同期回避、`cd ~/repos/...` 風に書ける |
| `C:\Users\<user>\Documents\` | ❌ OneDrive 同期されると node_modules が地獄 |
| `C:\` 直下 | ❌ 権限・パス短縮以外メリットなし、事故りやすい |
| OneDrive 配下 | ❌ ファイルロック競合・容量圧迫・ビルド遅延 |

### 4-2. 手順
```powershell
mkdir C:\Users\$env:USERNAME\repos -ErrorAction SilentlyContinue
cd C:\Users\$env:USERNAME\repos
git clone https://github.com/<owner>/<repo>.git
cd <repo>
```

## 5. 環境変数ファイル `.env.local` の扱い

### 5-1. 配置場所
**Next.js プロジェクトのルート直下**（`package.json` と同じ階層）。
このリポジトリだと `outfit-weather/.env.local`。

### 5-2. 作成手順
```powershell
cd outfit-weather
copy .env.local.example .env.local
notepad .env.local
```
メモ帳で開いて `=` の右側にキーを貼って保存。

### 5-3. メモ帳で保存する時の注意
メモ帳が「テキストドキュメント」として保存しようとして `.env.local.txt` になることがある。
保存ダイアログで「ファイルの種類」を **すべてのファイル** に切り替えてから保存すれば防げる。

なってしまったら：
```powershell
ren .env.local.txt .env.local
```

### 5-4. Git で追跡されない仕組み
`outfit-weather/.gitignore` に以下が入っているので自動で除外される：
```
.env*
!.env*.example
```
- `.env*`: `.env`, `.env.local`, `.env.production` など全部除外
- `!.env*.example`: ただし `.env.local.example` のようなテンプレートだけは含める

`git status` に `.env.local` が出ないのが正常。出てしまったらすぐ確認。

### 5-5. 公開してはいけないキー
| 接頭辞 | クライアント露出 |
|---|---|
| `NEXT_PUBLIC_*` | ✅ ブラウザに渡る。公開可キーのみ |
| 接頭辞なし（例: `OPENWEATHER_API_KEY`） | ❌ サーバ側のみ。Route Handler 経由で使う |

`service_role` / `secret` 系のキーは **絶対** `NEXT_PUBLIC_` を付けない。

## 6. 動作確認
```powershell
npm install
npm run dev
```
- 初回 `npm install` は数分かかる
- `http://localhost:3000` をブラウザで開いてページが表示されればOK
- 止めるときは PowerShell で **Ctrl + C** → `Y` → Enter

## ハマりポイント早見表

| 症状 | 原因 | 対処 |
|---|---|---|
| `npm : ... スクリプトの実行が無効` | PowerShell ExecutionPolicy | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `git : 用語 'git' は…として認識されません` | Git for Windows 未インストール / PATH未反映 | インストール → PowerShell 再起動 |
| Visual Studio Installer がフリーズ | Node.js のオプションでビルドツールDL中の通信エラー | ウィンドウを閉じてOK。Node.js 本体は別なので影響なし |
| `Module not found: ...supabase` | `.env.local` の値が空 / ファイルが無い | `.env.local` の中身を確認 |
| `.env.local.txt` ができている | メモ帳の保存ダイアログで自動的に拡張子付与 | `ren .env.local.txt .env.local` |
| `node_modules` が OneDrive で同期されて重い | Documents 配下にクローンしたため | `C:\Users\<user>\repos\` に移動 |
| port 3000 が使用中 | 他プロセスが占有 | `npm run dev -- -p 3001` で別ポート |

## 関連
- [001-claude-code-usage.md](./001-claude-code-usage.md) — Claude Code の基本的な使い方
- [005-supabase-project-setup.md](./005-supabase-project-setup.md) — Supabase プロジェクト作成
- [../troubleshooting/](../troubleshooting/) — その他のトラブル対処

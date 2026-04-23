# Claude Code から push できない（GitHub App 権限不足）

## 症状
Web版 Claude Code（claude.ai/code）でコミットを作って push しようとすると以下のエラーで失敗する。

```
remote: Permission to <owner>/<repo>.git denied to <owner>.
fatal: unable to access 'http://127.0.0.1:xxxxx/git/<owner>/<repo>/':
       The requested URL returned error: 403
```

GitHub MCP 経由のブランチ作成も同じく 403 で落ちる：
```
failed to create branch: ... 403 Resource not accessible by integration
```

## 原因
Claude Code（Web版）の GitHub App に対象リポジトリへの **`Contents: write`** 権限が付与されていない。

ローカル版 Claude Code（自分のPC上）はOAuthで認証するので関係ない。
**Web 版を使うとき限定の問題**。

## 対処：GitHub App に書き込み権限を付与

### 1. インストール済みアプリ画面を開く
ブラウザで：
```
https://github.com/settings/installations
```
（自分のアバター → Settings → 左メニュー下部の Applications → Installed GitHub Apps でも同じ場所）

### 2. Claude を見つけて Configure
リストの中の **Claude** または **Claude Code** の右側 **Configure** をクリック。

見当たらない場合はまずインストール：https://github.com/apps/claude

### 3. リポジトリへのアクセスを付与
"Repository access" セクションで：
- **Only select repositories** を選択
- **Select repositories** で対象リポジトリを追加
- **Save**

### 4. Permissions を確認
"Repository permissions" の項目で以下が **Read and write** になっていることを確認：

| 権限 | 必要レベル |
|---|---|
| Contents | **Read and write** |
| Pull requests | Read and write（PR を作る/レビューする場合） |
| Metadata | Read |

新しい権限要求の緑バナー（"Accept new permissions"）が出ていたら **Accept**。

### 5. 再試行
Claude Code に戻って `git push -u origin <branch>` を再実行。
今度は通るはず。

## ハマりやすいポイント

### Organization リポジトリの場合
個人ではなく Organization のリポジトリは、Org 管理者が App 承認しないとインストールできない。
Settings → Applications で対象 Org にチェックが入っているか確認。
チェックできない場合は管理者に依頼する。

### MCP 経由のブランチ作成も失敗する
GitHub MCP の `mcp__github__create_branch` も同じ App の権限を使うので、
git push が失敗する状況では MCP 経由でもブランチ作成 / ファイル作成は失敗する。

権限を付与すると両方とも通るようになる。

### 権限変更が即時反映されない時
1. ブラウザで GitHub から一度サインアウト → 再ログイン
2. Claude Code 側のセッションをリロード
3. それでもダメなら数分待つ（GitHub 側のキャッシュ）

## 関連
- 権限付与で対応できないネットワーク系のエラーは別問題（プロキシ・DNS等）
- `403` ではなく `401 Unauthorized` の場合はトークン失効。再認証が必要

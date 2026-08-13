# 技術的な積み残し

最終更新: 2026-08-13

すぐに壊れるものではないが、放置すると効いてくる項目。着手順は上から。

---

## 1. 本番DBの認証情報がリポジトリに直書き ✅ 完了（2026-08-13）

**だった問題**: `express-mysql-docker/docker-compose.prod.yml` の `nextjs` サービスに
`DB_USER=root` / `DB_PASSWORD=rootpassword` が平文で書かれ、git に追跡されていた。
しかもその値は**本番で実際に使われている現役のパスワード**だった（`db/.env` の
`MYSQL_ROOT_PASSWORD` と一致することを確認）。パスワードは `3cdb710` で履歴に混入。

### やったこと

**ファイル側**（親リポジトリ `75f3d22`）

- `docker-compose.prod.yml` の `environment:` から `DB_USER` / `DB_PASSWORD` を削除。
  `env_file: ./nextjs/.env` は元々あったので、2行消すだけで `.env` 側から供給される
- `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_CONNECTION_LIMIT` は秘匿情報ではないので compose に残した
- `nextjs/.env.example` を新規追加（サーバー側 `.env` が未追跡でキーが不明だったため）

**本番側**

- `appuser` は既に実在した（`db/.env` の `MYSQL_USER`）。パスワードを新規発行して設定
- 権限は `GRANT SELECT, INSERT, UPDATE, DELETE ON myapp.*` のみ。
  アプリのSQLは DML だけで DDL を投げないため、これで足りる
- `/var/www/app/nextjs/.env` に `DB_USER` / `DB_PASSWORD` を追記
- **`root` のパスワードをローテーション**。`root@localhost` と `root@%` の2アカウントが
  存在したので両方に `ALTER USER`。`password_last_changed` が2行とも更新済みなのを確認
- `/var/www/app/db/.env` も新しい値に更新（既存ボリュームには効かないが再構築時の食い違い防止）

これにより、git履歴に残る `rootpassword` はどのアカウントでも通らなくなった。

### 学んだこと（次に似た作業をするとき用）

- `environment:` は `env_file:` より優先される。`.env` に書いても `environment:` に
  同じキーがあると無視されるので、**消す側の作業が必須**
- MySQL の `MYSQL_ROOT_PASSWORD` などは**データ領域の初回作成時にしか読まれない**。
  既存DBのパスワード変更は `ALTER USER` でしか行えず、`.env` の書き換えは効かない
- MySQL のアカウントは「ユーザー名 + 接続元ホスト」の組。`root@localhost` と
  `root@%` は別アカウントで、パスワードも別管理。片方だけ変えても意味がない
- デプロイ前に `.env` の値で実際に接続できるか試せば（`mysql -uappuser -p"$(grep ...)"`）、
  切り替え失敗のリスクをゼロにできる

### 残っている軽い課題

- ローカルの `next-basic/.env.local` に GHCR の PAT が平文コメントで残っている。
  git 履歴には**入っていないことを確認済み**（両リポジトリで `-S` 検索）。
  緊急ではないが、有効なトークンなら GitHub 側で失効させたい
- `root@%` は「どのホストからでも root で入れる」設定。今回は残したが、
  アプリが `appuser` に移行済みなので、将来的には削除を検討してよい

---

## 2. クイズ詳細ページのhydrationエラー

**場所**: `/quiz/[category]/[quizId]`

ページを開くだけで、ブラウザコンソールに `Hydration failed because the server rendered text ...` が出る。操作は不要で、初回ロードで必ず発生する。

**既存の問題であることは確認済み**（2026-08-12）。解説フォーマット統一の変更を `git stash` して元コードで再現したところ、同じエラーが出た。今回の変更が原因ではない。

**再現手順**

`.claude/launch.json` の devサーバーを起動し、新しいタブで下記を開いてコンソールを見る。

- `/quiz/vue-basic/196`
- `/quiz/react-basic/1`

**調査の当たり**

サーバーとクライアントで値が変わるものが原因のはず。候補は以下。

- localStorage を読む `src/hooks/useQuizBookmarks.ts` / `src/hooks/useQuizHistory.ts`
- `?from=` を扱う `src/lib/quizOrigin.ts`
- 状態を持つ `src/app/quiz/[category]/[quizId]/QuizInteraction.tsx`

**影響**

表示は正常なので実害は出ていないが、hydrationエラーが出ている間は他のReactエラーが埋もれる。コンソールを信用できる状態に戻しておきたい。

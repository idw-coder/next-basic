# 技術的な積み残し

最終更新: 2026-08-12

すぐに壊れるものではないが、放置すると効いてくる項目。着手順は上から。

---

## 1. 本番DBの認証情報がリポジトリに直書き

**場所**: `express-mysql-docker/docker-compose.prod.yml` の `nextjs` サービス `environment:` ブロック

`DB_USER` と `DB_PASSWORD` が平文で書かれたまま、gitに追跡されている。イメージは公開レジストリ（ghcr.io）へ push しているため、露出範囲が読みにくい状態。

**一般的なやり方**

1. 認証情報は compose ファイルに書かず、gitignore された `.env` に置いて `env_file:` で読ませる
2. アプリ用のDBユーザーを作り、必要最小限の権限だけ与える（`root` を使わない）
3. 既にgit履歴に入っているパスワードは、ファイルから消しても履歴に残るので**ローテーションが必要**

**この構成で楽なこと**

`docker-compose.prod.yml` は既に `env_file: ./nextjs/.env` と `env_file: ./db/.env` を使っている。つまり仕組みは出来ていて、`environment:` に重複して直書きしているだけ。`environment:` から DB_* を削り `.env` 側へ移すだけで済む。

**確認すること**

- `./nextjs/.env` と `./db/.env` が gitignore されているか
- `git log -p --all -- docker-compose.prod.yml` で履歴に残っていないか（残っていればMySQLのパスワード変更まで実施）
- 変更後、`src/lib/server/mysql.ts` が `DB_HOST` / `DB_USER` / `DB_NAME` 必須なので、起動して接続できるか

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

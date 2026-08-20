# 作業ルール

このファイルがこのリポジトリの作業ルールの正本。Codex（ChatGPT）とCursorが自動で読む。Claude Codeは `CLAUDE.md` からこのファイルを取り込む。ChatGPTのブラウザ版など自動で読まないツールに委任するときは、このファイルを貼ること。

## devサーバーとVelite（最重要）

このリポジトリは複数のAIセッションに並行で作業を委任することがある。**devサーバーの多重起動は `.velite/` を破壊する。**

- **devサーバーを起動しない。** `npm run dev` / `next dev` / preview_start はすべて禁止（settings.json の deny でブロック済み）
- **`npx velite` を実行しない。** `velite.config.ts` は `clean: true` のため、`.velite/` を消してから作り直す。他セッションのdevサーバーが即座に500になる
- **`npm run build` も避ける。** 中身は `velite && next build` で、上と同じ破壊が起きる

理由: Veliteのwatchはロックも一時ファイルも使わず `.velite/chapters.json`（約10MB）を直接 `writeFile` する。2プロセスが同時に書くとJSONが壊れ、`Cannot parse JSON: Extra data` で全ページが500になる。MDXを直しても直らない。

復旧（人間が実行する）: 余分な `next-server` プロセスを止めてから `npx velite build --clean` を1回。

## 表示確認のしかた

1. `lsof -nP -iTCP -sTCP:LISTEN | grep node` で既存のdevサーバーを探す
2. 立っていれば `curl http://localhost:<port>/...` やブラウザツールでそこを見る（起動はしない）
3. 立っていなければ**表示確認はスキップし、その旨を報告して終える**。勝手に起動しない

サーバーなしでできる検証は積極的に行う。

- `npx tsc --noEmit`
- 記事中の外部URLを `curl -s -o /dev/null -w "%{http_code}" -L <url>` で全件200確認
- 内部リンクの参照先ファイルが実在するかの確認

## コンテンツ（content/books）を書くとき

- 仕様と執筆ルールは [docs/books.md](docs/books.md)。改善タスクの指示書は [docs/content/ai-tasks.md](docs/content/ai-tasks.md)
- 同じ本を複数セッションで並行編集しない
- 新規章のファイル名に連番を付けない（URLに残るため）。並び順は frontmatter の `order` で管理する
- **新しい本を1冊追加したら、`docs/books.md` の「デプロイ後の作業」を1〜6まで全部実行する。** テーマ色・表示順・NEWバッジ・クイズ連携・検索サジェスト・**トップページのお知らせ（`src/app/page.tsx` の `NEWS` 配列）**。特に6番目は忘れられやすい。MDXを置いただけでは公開作業は終わっていない
- **日本語で `**強調**` を閉じるとき、`**` の直前に全角括弧や句読点を置かない。** CommonMarkのflanking規則により太字にならず、`**` がそのまま表示される
  - 誤: `**文（statement）**と、` / 正: `**文**（statement）と、`

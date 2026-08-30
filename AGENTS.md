# 作業ルール

このファイルがこのリポジトリの作業ルールの正本。Codex（ChatGPT）とCursorが自動で読む。Claude Codeは `CLAUDE.md` からこのファイルを取り込む。ChatGPTのブラウザ版など自動で読まないツールに委任するときは、このファイルを貼ること。

## devサーバーとVelite（最重要）

このリポジトリは複数のAIセッションに並行で作業を委任することがある。**devサーバーの多重起動は `.velite/` を破壊する。** 起動そのものは禁止しないが、順番は必ず守ること。

1. **起動前に必ず既存を確認する。** `lsof -nP -iTCP -sTCP:LISTEN | grep node`
2. **すでに立っていたら起動しない。** そのポートを `curl` やブラウザツールで見る
3. **1つも立っていないときに限り、1つだけ起動してよい。** `npm run dev`（またはpreview_startの `next-dev`）。2つ目は絶対に起動しない
4. 起動したら、そのセッションの間は使い回す。他セッションが使うので、止めるかどうかは任意

- **`npx velite` を単独で実行しない。** `velite.config.ts` は `clean: true` のため、`.velite/` を消してから作り直す。他セッションのdevサーバーが即座に500になる
- **`npm run build` も避ける。** 中身は `velite && next build` で、上と同じ破壊が起きる

理由: Veliteのwatchはロックも一時ファイルも使わず `.velite/chapters.json`（約10MB）を直接 `writeFile` する。2プロセスが同時に書くとJSONが壊れ、`Cannot parse JSON: Extra data` で全ページが500になる。MDXを直しても直らない。

復旧: 余分な `next-server` プロセスを止めてから `npx velite build --clean` を1回（`npx velite` はdenyのまま。人間が実行する）。

## 表示確認のしかた

1. `lsof -nP -iTCP -sTCP:LISTEN | grep node` で既存のdevサーバーを探す
2. 立っていれば `curl http://localhost:<port>/...` やブラウザツールでそこを見る（**起動しない**）
3. 立っていなければ、上のルールに従って1つだけ起動して確認する

サーバーなしでできる検証は先に済ませておく。

- `npx tsc --noEmit`
- 記事中の外部URLを `curl -s -o /dev/null -w "%{http_code}" -L <url>` で全件200確認
- 内部リンクの参照先ファイルが実在するかの確認

## コンテンツ（content/books）を書くとき

- 仕様と執筆ルールは [docs/books.md](docs/books.md)。改善タスクの指示書は [docs/content/ai-tasks.md](docs/content/ai-tasks.md)
- 同じ本を複数セッションで並行編集しない
- 新規章のファイル名に連番を付けない（URLに残るため）。並び順は frontmatter の `order` で管理する
- **章立て計画のある本は、追加する前にその計画ファイルを読む。** 計画側で最終的な `order` が確定しているので、思いついた順に連番を振ると並びが壊れる。既存章の `order` は動かさず、あいだに差し込むときは小数（`order: 5.5`）＋ `chapterLabel` を使う
  - MySQL: [docs/content/mysql-book-plan.md](docs/content/mysql-book-plan.md)（全13章。公開済みは1・2・3・10のみで、章番号が飛ぶのは意図的）
- **既存の本に章を追加しただけなら「デプロイ後の作業」1〜6は不要。** ただし、その章で新しい主要概念（API名・キーワード・エラー名など）を扱ったなら、`src/app/books/_constants/searchSuggestions.ts` の検索サジェストは随時足してよい。追加した章は既存読者から見つかりにくいため。基準と入れ替え方は [docs/books.md](docs/books.md) の「章を追加したら検索サジェストを見直す」
- 章を差し込んだら、**前後の章の「次の章」リンクがずれていないか確認する。** 小数 `order` で割り込むと、既存章の橋渡し文が別の章を指したままになる
- **新しい本を1冊追加したら、`docs/books.md` の「デプロイ後の作業」を1〜6まで全部実行する。** テーマ色・表示順・NEWバッジ・クイズ連携・検索サジェスト・**トップページのお知らせ（`src/app/page.tsx` の `NEWS` 配列）**。特に6番目は忘れられやすい。MDXを置いただけでは公開作業は終わっていない
- **日本語で `**強調**` を閉じるとき、`**` の直前に全角括弧や句読点を置かない。** CommonMarkのflanking規則により太字にならず、`**` がそのまま表示される
  - 誤: `**文（statement）**と、` / 正: `**文**（statement）と、`

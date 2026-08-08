# docs 整理メモ

最終確認日: 2026-08-08

## 読む順番

1. `books.md`
   - 教科書（Books）機能の仕様とコンテンツ作成ルールの一次情報。
   - 章を追加・修正するときはまずここを見る。
2. `content/ai-tasks.md`
   - Books 改善タスクを別AIセッションへ委任するための指示集。
   - 完了済みタスクも履歴として残している。
3. `operations/subscription-payment.md`
   - Stripe サブスクリプション画面と正式リリース時の作業メモ。
4. `operations/google-adsense.md`
   - AdSense の読み込み、手動広告、広告非表示制御のメモ。

## ファイル一覧

| ファイル | 位置づけ | 状態 |
|---|---|---|
| `books.md` | Books 仕様・制作ガイドの一次情報 | 現行 |
| `content/ai-tasks.md` | Books改善の委任用タスク集 | 一部完了済み。未着手は P1-b / P4一部 / P6 / P7 |
| `content/mdx-chapter-generation-prompt.md` | 旧式の章生成プロンプト | 参照用。新規作成時は `books.md` を優先 |
| `operations/subscription-payment.md` | サブスクリプション決済仕様 | 準備中機能。Feature Flag で動作確認可 |
| `operations/google-adsense.md` | AdSense設定メモ | 現行 |
| `operations/x-operation-summary.md` | X運用メモ | 運用メモ。最新数値は要確認 |
| `technical/mui-progress.md` | MUI導入メモ | 管理画面限定の実験メモ |
| `technical/express-to-nextjs-migration.md` | Express移行計画 | 古い計画。現状とズレがあるため着手前に再設計が必要 |

## 整理時に確認・修正した内容

- `books.md` と `content/mdx-chapter-generation-prompt.md` は章作成ルールが重複している。一次情報は `books.md` に寄せる。
- `content/ai-tasks.md` の P5 は実装済み。`velite.config.ts` の `updated` と `src/app/sitemap.ts` の lastModified 連携を確認済み。
- P4 の公式ドキュメントリンクは、`css-basics` も全12章に参考リンクが入っている。残りは `react-learning` と `next-js` が中心。
- `operations/subscription-payment.md` の Feature Flag 説明を、実装に合わせて `SubscriptionClient.tsx` 内の `sessionStorage` 管理へ修正した。
- `operations/google-adsense.md` の手動広告説明を、現在のフッター描画に合わせて修正した。
- `technical/express-to-nextjs-migration.md` は TypeORM 直接参照への移行計画だが、現在の `next.config.ts` は `/api/*` を Express にプロキシし、Next.js 側のAPIは `/next-api/*` に置く方針になっている。

## 残っている主な作業

- `content/books/` の draft プレースホルダー章を執筆する。
- `react-learning` と `next-js` の章に公式ドキュメントリンクを横展開する。
- 章ごとの動的OG画像を検討する。
- 章末フィードバックウィジェットを設計する。
- X運用メモのサイト数値と自動化方針を最新化する。

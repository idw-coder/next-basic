# Express → Next.js API 移行メモ

> 状態（2026-08-09 更新）: 現在は Express バックエンドを維持しつつ、一部の読み取りAPIを Next.js 側へ移行中。`/api/*` は Next.js から Express へプロキシし、Next.js 自身の Route Handler は `/next-api/*` に置く。

## 現在の前提

### ルーティング

- `next.config.ts` で `/api/:path*` を `INTERNAL_API_URL` または `http://localhost:8888` へ rewrite している。
- そのため、`src/app/api/...` に Route Handler を追加しても `/api/...` としては扱いにくい。
- Next.js 側で独自に持つAPIは `src/app/next-api/...` に置く方針。
- このリポジトリ上で確認できる Next.js Route Handler は `src/app/next-api/site-search/route.ts`, `src/app/next-api/quiz/categories/route.ts`, `src/app/next-api/quiz/tags/route.ts`, `src/app/next-api/quiz/search/route.ts`, `src/app/next-api/quiz/category/[categoryId]/tags/route.ts`, `src/app/next-api/quiz/category/[categoryId]/quizzes/route.ts`。
- 本番 `https://study.ntorelabo.com/next-api/site-search`, `/next-api/quiz/categories`, `/next-api/quiz/tags`, `/next-api/quiz/search`, `/next-api/quiz/category/:categoryId/tags` で 200 OK / JSON 応答を確認済み。

### フロントエンドからのAPI呼び出し

- `src/lib/api.ts` は `INTERNAL_API_URL` / `NEXT_PUBLIC_API_BASE_URL` / `http://localhost:8888` を基準に Express API を呼ぶ。
- ブラウザ上では `localStorage` の `token` を Bearer トークンとして付与する。
- Server Component / Route Handler では `API_BASE_URL + '/api/...'` または `fetchApiJson('/api/...')` で Express API を呼ぶ。

### DBアクセス

- Next.js 側のDB直接参照用に `mysql2` を追加済み。
- `next.config.ts` には `serverExternalPackages: ['mysql2']` を設定済み。
- Next.js 側ではORMを使わず、現時点では `mysql2/promise` で最小限に進める。
- `typeorm` / `reflect-metadata` は入っていない。
- `src/lib/datasource.ts` や `src/entities/...` は存在しない。
- DB接続は `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_CONNECTION_LIMIT` を使う。

### Express 側コード

- この `next-basic` リポジトリ内には Express の routes / controllers / entities は含まれていない。
- 移行を再開する場合は、Express バックエンド側のリポジトリまたはディレクトリを別途確認する必要がある。

## 現在 `/api` に依存している主な機能

| 領域 | 主なエンドポイント | 呼び出し元 |
|---|---|---|
| クイズ公開ページ | ~~`GET /api/quiz/categories`~~（移行済み: `/next-api/quiz/categories`）, ~~`GET /api/quiz/tags`~~（移行済み: `/next-api/quiz/tags`）, ~~`GET /api/quiz/category/:id/quizzes`~~（実装済み・本番未確認: `/next-api/quiz/category/:id/quizzes`）, ~~`GET /api/quiz/category/:id/tags`~~（移行済み: `/next-api/quiz/category/:id/tags`）, `/api/quiz/:quizId`, ~~`GET /api/quiz/search`~~（移行済み: `/next-api/quiz/search`） | トップ、検索、カテゴリ、個別クイズ、サイト内検索 |
| クイズ履歴 | `/api/quiz/history`, `/api/quiz/history/sync` | 学習履歴、プロフィール、復習 |
| 認証 | `/api/auth/login`, `/api/auth/me`, `/api/auth/google` | ログイン、登録、プロフィール |
| ユーザー管理 | `/api/users`, `/api/users/:id` | 管理画面 |
| クイズ管理 | `/api/quiz`, `/api/quiz/:id`, ~~`GET /api/quiz/categories`~~（移行済み・管理画面側の呼び出し切替は未完了）, `POST/PUT/DELETE /api/quiz/categories`, ~~`GET /api/quiz/tags`~~（移行済み・管理画面側の呼び出し切替は未完了）, `POST/PUT/DELETE /api/quiz/tags`, `/api/quiz/csv/*` | 管理画面 |
| 決済 | `/api/payment/subscription`, `/api/payment/portal`, `/api/payment/status/:sessionId`, `/api/webhook/stripe` | サブスクリプション画面、Stripe |

注: ~~取り消し線~~ の `/api` は Next.js 側へ移行済み、または実装済みで本番確認待ち。Express 側の同名GETは、既存クライアント・管理画面・Next.jsフォールバック用として当面残す。ただし最終目標は Express 廃止のため、フォールバックも移行完了後に削除対象とする。

## 移行ステータス

### 移行済み

| 機能 | Next.js 側エンドポイント | 実装 | 状態 | 備考 |
|---|---|---|---|---|
| サイト内検索の集約API | `/next-api/site-search` | `src/app/next-api/site-search/route.ts` | 本番稼働済み | ヘッダー検索から利用。Books検索はNext.js内で完結。カテゴリ一覧・タグ一覧・クイズ検索はNext.js側取得へ切り替え済み |
| クイズカテゴリ一覧 GET | `/next-api/quiz/categories` | `src/app/next-api/quiz/categories/route.ts`, `src/lib/server/quizCategories.ts`, `src/lib/server/mysql.ts` | 本番稼働済み | Next.js側DB直接参照の1本目。`quiz_category` と `quiz` をMySQLから直接読み、`quiz_count` を集計する。DB取得に失敗した場合はExpressの `/api/quiz/categories` へフォールバックする |
| クイズタグ一覧 GET | `/next-api/quiz/tags` | `src/app/next-api/quiz/tags/route.ts`, `src/lib/server/quizTags.ts`, `src/lib/server/mysql.ts` | 本番稼働済み | `quiz_tag`, `quiz_tagging`, `quiz` をMySQLから直接読み、削除済みクイズを除いて `quiz_count` を集計する。DB取得に失敗した場合はExpressの `/api/quiz/tags` へフォールバックする |
| クイズ検索 GET | `/next-api/quiz/search` | `src/app/next-api/quiz/search/route.ts`, `src/lib/server/quizSearch.ts`, `src/lib/server/mysql.ts` | 本番稼働済み | `q`, `categoryId`, `tagSlug`, `ids` を受け付ける。`quiz`, `quiz_category`, `quiz_tagging`, `quiz_tag` をMySQLから直接読み、DB取得に失敗した場合はExpressの `/api/quiz/search` へフォールバックする |
| カテゴリ別タグ一覧 GET | `/next-api/quiz/category/:categoryId/tags` | `src/app/next-api/quiz/category/[categoryId]/tags/route.ts`, `src/lib/server/quizCategoryTags.ts`, `src/lib/server/mysql.ts` | 本番稼働済み | `quiz_tag`, `quiz_tagging`, `quiz` をMySQLから直接読み、カテゴリ内の削除済みでないクイズに紐づくタグを返す。DB取得に失敗した場合はExpressの `/api/quiz/category/:categoryId/tags` へ一時フォールバックする |

確認済み:

- `https://study.ntorelabo.com/next-api/site-search` は 200 OK / JSON を返す。
- `https://study.ntorelabo.com/next-api/site-search?q=javascript` は 200 OK / JSON を返す。
- `https://study.ntorelabo.com/next-api/quiz/categories` は 200 OK / JSON を返す。`x-next-api-fallback` ヘッダーなし。
- `https://study.ntorelabo.com/next-api/quiz/tags` は 200 OK / JSON を返す。`x-next-api-fallback` ヘッダーなし。
- `https://study.ntorelabo.com/next-api/quiz/search?q=javascript` は 200 OK / JSON を返す。`x-next-api-fallback` ヘッダーなし。
- `https://study.ntorelabo.com/next-api/quiz/category/1/tags` は 200 OK / JSON を返す。`x-next-api-fallback` ヘッダーなし。
- `src/components/HeaderSearch.tsx` は `/next-api/site-search` を呼ぶ。

### 実装済み・デプロイ待ち

| 機能 | Next.js 側エンドポイント | 実装 | 状態 | 備考 |
|---|---|---|---|---|
| カテゴリ別クイズ一覧 GET | `/next-api/quiz/category/:categoryId/quizzes` | `src/app/next-api/quiz/category/[categoryId]/quizzes/route.ts`, `src/lib/server/quizCategoryQuizzes.ts`, `src/lib/server/mysql.ts` | ローカル実装済み / 本番未確認 | `q`, `tagSlug` を受け付ける。`quiz`, `quiz_category`, `quiz_tagging`, `quiz_tag` をMySQLから直接読み、カテゴリ内の削除済みでないクイズを返す。DB取得に失敗した場合はExpressの `/api/quiz/category/:categoryId/quizzes` へ一時フォールバックする |

### 部分移行

| 機能 | Next.js 化された範囲 | Express に残っている範囲 | 次に移すなら |
|---|---|---|---|
| サイト内検索 | 検索結果の集約、Books検索、レスポンス整形、カテゴリ一覧取得、タグ一覧取得、クイズ検索取得 | 現時点ではなし | 次は利用画面側の直接 `/api` 呼び出しが残っていないか確認する |
| クイズカテゴリ一覧 | `/next-api/quiz/categories` を追加し、MySQL直接参照を実装 | 既存画面の多くはまだ `/api/quiz/categories` を利用中。POST/PUT/DELETE はExpressのまま | まず `site-search` 以外の公開ページでGETだけ切り替える |
| クイズタグ一覧 | `/next-api/quiz/tags` を追加し、MySQL直接参照を実装 | 既存画面の多くはまだ `/api/quiz/tags` を利用中。POST/PUT/DELETE はExpressのまま | `site-search` 以外の公開ページでGETだけ切り替える |
| カテゴリ別タグ一覧 | `/next-api/quiz/category/:categoryId/tags` を追加し、カテゴリページのタグ取得をNext.js側へ切り替え | Express側GETは一時フォールバックとして残す | 次はフォールバックを外せる段階まで利用画面を確認する |
| カテゴリ別クイズ一覧 | `/next-api/quiz/category/:categoryId/quizzes` を追加し、カテゴリページ・ランダム出題・トップページ件数・サイトマップの取得をNext.js側へ切り替え | 本番確認前。管理画面の一覧取得はExpressのまま | 本番確認後、移行済みに更新する |

### 未移行

| 領域 | 状態 |
|---|---|
| クイズ公開API | カテゴリ一覧GET・タグ一覧GET・クイズ検索GET・カテゴリ別タグ一覧GETはNext.js側で本番稼働済み。カテゴリ別クイズ一覧GETは実装済み・本番未確認。その他は Express の `/api/quiz/...` を利用中 |
| クイズ履歴API | Express の `/api/quiz/history...` を利用中 |
| 認証API | Express の `/api/auth/...` を利用中 |
| ユーザー管理API | Express の `/api/users...` を利用中 |
| クイズ管理API | Express の `/api/quiz...` を利用中 |
| 決済API / Stripe Webhook | Express の `/api/payment...` / `/api/webhook/stripe` を利用中 |

## 引き継ぎメモ

- 「移行済み」と書く場合は、Next.js 側に Route Handler またはサーバー処理があり、本番で疎通確認できているものだけにする。
- Express APIを内部で呼んでいる場合は「部分移行」として、残っている依存先を明記する。
- 実装したが本番確認前のものは「実装済み・デプロイ待ち」に置き、本番確認後に「移行済み」へ移す。
- 新しい移行が完了したら、この文書の「移行ステータス」に機能名、Next.js側エンドポイント、実装ファイル、本番確認結果、残依存を追記する。
- 本番確認は最低限、対象の `/next-api/...` が 200 OK を返すことと、対応する画面がそのAPIを呼んでいることを確認する。
- Express フォールバックは移行中の安全装置。最終的に Express を廃止する段階では、Next.js 側のフォールバック呼び出しも削除する。
- `/api/...` が Express 側で処理されているか確認したい場合は、レスポンスヘッダーの `X-Powered-By: Express` が参考になる。

## 当面の方針

### 原則

- Express を残す移行中は、必要に応じて既存API `/api/...` を維持する。
- Next.js だけで完結する集約APIやサイト内検索APIは `/next-api/...` に追加する。
- `/api/...` に Next.js Route Handler を作る場合は、rewrite の例外設計または `/api` の所有者変更を先に決める。
- DB直接参照を導入する場合は、Express 側の実装・スキーマ・認証仕様を確認してから実装する。現時点ではORMを導入しない。

### 推奨する短期対応

1. 既存の Express API 呼び出しは維持する。
2. 新規の Next.js 内部APIは `/next-api/...` に作る。
3. `src/app/api/...` を使う指示やメモがあれば `/next-api/...` 前提に読み替える。
4. DB直接参照は `mysql2/promise` で小さく進める。ORM導入は複数APIで重複や複雑さが出てから再検討する。

## Express 廃止を再開する場合の進め方

### Phase 0: 現状棚卸し

- Express 側の routes / controllers / services / entities を一覧化する。
- 各APIのレスポンス形式、認証要否、利用画面、更新系の副作用を確認する。
- 本番の Nginx / docker-compose / 環境変数で `/api` がどこへ流れているか確認する。

### Phase 1: 読み取り系APIの移行

- 対象候補:
  - `/api/quiz/categories`
  - `/api/quiz/tags`
  - `/api/quiz/category/:id/quizzes`
  - `/api/quiz/category/:id/tags`
  - `/api/quiz/:quizId`
- 最初は Next.js 側の `/next-api/...` として並行実装し、画面単位で呼び出し先を切り替える。
- DBアクセス方式は Express 側の実装に合わせて決める。TypeORM 前提で始めない。
- 2026-08-09 時点で `/next-api/quiz/categories`, `/next-api/quiz/tags`, `/next-api/quiz/search`, `/next-api/quiz/category/:id/tags` は本番稼働済み。`/next-api/quiz/category/:id/quizzes` は実装済み・本番未確認。次は `/next-api/quiz/:quizId` が候補。

### Phase 2: 認証・ユーザー系APIの移行

- JWT の発行・検証・期限・保存場所を整理する。
- Google OAuth は Passport 継続、NextAuth.js、自前OAuthのどれに寄せるか決める。
- 管理画面の権限判定は admin / editor の境界を先に固定する。

### Phase 3: 更新系・管理系APIの移行

- クイズCRUD、カテゴリCRUD、タグCRUD、CSV import/export を移行する。
- バリデーション、権限、既存レスポンス形式を Express と合わせる。
- 管理画面側の `api.get/post/put/delete('/api/...')` を段階的に置き換える。

### Phase 4: 外部連携APIの移行

- ファイルアップロードは `multer` 依存を Web API の `formData()` ベースへ置き換える。
- Stripe Webhook は raw body と署名検証を先に検証する。
- メール送信は postfix 前提を維持するか、別サービスへ移すか決める。

### Phase 5: `/api` の所有者変更

- Next.js 側へ十分に移行できた段階で、`/api/*` rewrite を削除または例外化する。
- Express に残すAPIがある場合は `/legacy-api/...` などに分離する。
- 本番の Nginx / docker-compose / health check / 環境変数を更新する。

### Phase 6: Express コンテナ廃止

- Vue.js 管理画面の配信先を決める。
- backend サービスを docker-compose から削除する。
- 本番デプロイ手順とロールバック手順を更新する。

## 注意点

- 旧メモにあった「TypeORM 1.0.0 追加」「`app/api/quiz/search/route.ts` 作成」「`lib/datasource.ts` 作成」は、現在のコードでは確認できない。
- Next.js側はORMなし。TypeORM用デコレータ設定も削除済み。
- `/next-api/site-search` は Next.js 内部API。カテゴリ一覧は `src/lib/server/quizCategories.ts`、タグ一覧は `src/lib/server/quizTags.ts`、クイズ検索は `src/lib/server/quizSearch.ts` 経由でNext.js側取得へ切り替え済み。
- 本番 `https://study.ntorelabo.com/api/quiz/categories` は `X-Powered-By: Express` 付きで 200 OK を返すため、本番でも `/api` は Express 側で処理されている。
- Stripe Webhook は raw body と署名検証が必要なため、単純な Route Handler 移植で済ませない。
- 認証・決済・CSV import は移行時の事故影響が大きいため、読み取り系APIより後に扱う。

## 次にやるなら

1. Express 側コードを確認できる場所を特定する。
2. `/api` エンドポイント一覧を実装ベースで作り直す。
3. 「Express 維持」「一部 `/next-api` 化」「Express 廃止」のどこを目標にするか決める。
4. 次の移行対象は公開読み取り系の `/api/quiz/:quizId` GET にする。

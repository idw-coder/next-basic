# Express → Next.js API 移行メモ

> 状態（2026-08-11 更新）: 主要APIは Next.js Route Handler へ移行済み。`/next-api/*` は Next.js 側でDB/外部サービスを直接処理し、Express fallback は削除済み。`/api/*` 全体rewriteも削除済みで、Expressへ転送するのは未移行の notes/upload など一部だけ。

## 現在の前提

### ルーティング

- `next.config.ts` で Express に残す一部パスだけを `INTERNAL_API_URL` または `http://localhost:8888` へ rewrite している。
- そのため、Next.js 側で独自に持つAPIは `src/app/next-api/...` に置く。
- 本番で `/next-api/*` から `x-next-api-fallback` ヘッダーは返さない。DBや外部サービス処理に失敗した場合は、Expressへ戻さずNext.js側のエラーとして返す。
- Next.jsに届いた `/api/quiz/*`, `/api/users`, `/api/auth/login`, `/api/payment/*`, `/api/webhook/stripe` は Express へ rewrite しない。
- Express へ残している rewrite は `/api/notes/*`, `/api/upload/*`, `/api/auth/test-mail`, `/api-docs`, `/api-docs.json`, `/uploads/*`。
- `X-Powered-By: Express` が出れば Express 側で処理されている。

### フロントエンドからのAPI呼び出し

- 移行済み画面の呼び出し先は `/next-api/*` へ切り替え済み。
- `src/lib/api.ts` は残っているが、現時点の `src` 配下では実API呼び出し元としては使われていない。
- ブラウザ上では `localStorage` の `token` を Bearer トークンとして付与する。

### DBアクセス

- Next.js 側のDB接続は ORM なしで `mysql2/promise` を使う。
- `next.config.ts` には `serverExternalPackages: ['mysql2']` を設定済み。
- DB接続は `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_CONNECTION_LIMIT` を使う。
- 認証つきRoute Handlerは Express と同じ `JWT_SECRET` が必要。
- Google OAuth は `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` が必要。callback URL は `NEXT_GOOGLE_CALLBACK_URL` を優先し、未設定時は `GOOGLE_CALLBACK_URL` の `/api/auth/google/callback` を `/next-api/auth/google/callback` に読み替える。
- Stripe 決済は `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL` が必要。Stripe Dashboard の Webhook URL は `https://study.ntorelabo.com/next-api/webhook/stripe`。

### Express 側コード

- この `next-basic` リポジトリ内には Express の routes / controllers / entities は含まれていない。
- Express 側を確認する場合は `/Users/tida/dev/personal/express-mysql-docker/backend` を見る。
- Express 側の移行済みAPIには「Next.jsへ移行済み、Expressはlegacy/fallback用」というコメントを追加済み。

## 現在 `/api` に残っている主な役割

| 領域 | 主なエンドポイント | 状態 |
|---|---|---|
| legacy API | `/api/quiz/*`, `/api/users`, `/api/auth/*`, `/api/payment/*`, `/api/webhook/stripe` | Next.js 側は `/next-api/*` で本番稼働済み。Next.jsのrewrite対象からは削除済み |
| ノート | `/api/notes` | 未移行。管理画面の notes ページは現状プレースホルダー。今回対応対象外 |
| アップロード | `/api/upload/*`, `/uploads/*` | 未移行。今回対応対象外 |
| 補助/開発 | `/api/auth/test-mail`, `/api-docs`, `/api-docs.json` | Express 側に残存 |

## 移行済み

| 機能 | Next.js 側エンドポイント | 実装 | 状態 | 備考 |
|---|---|---|---|---|
| サイト内検索 | `/next-api/site-search` | `src/app/next-api/site-search/route.ts` | 本番稼働済み | ヘッダー検索から利用。Books検索とクイズ検索の集約をNext.js側で処理 |
| クイズカテゴリ一覧/作成/更新/削除 | `/next-api/quiz/categories`, `/next-api/quiz/categories/:categoryId` | `src/app/next-api/quiz/categories/*`, `src/lib/server/quizCategories.ts` | 本番稼働済み | `quiz_category` と `quiz` をMySQLから直接処理。更新系は `editor` 以上 |
| クイズタグ一覧/詳細/作成/更新/削除 | `/next-api/quiz/tags`, `/next-api/quiz/tags/:tagId` | `src/app/next-api/quiz/tags/*`, `src/lib/server/quizTags.ts`, `src/lib/server/quizTagDetail.ts` | 本番稼働済み | `quiz_tag`, `quiz_tagging`, `quiz` をMySQLから直接処理。詳細/更新/削除は `editor` 以上 |
| クイズ検索 | `/next-api/quiz/search` | `src/app/next-api/quiz/search/route.ts`, `src/lib/server/quizSearch.ts` | 本番稼働済み | `q`, `categoryId`, `tagSlug`, `ids` 対応 |
| カテゴリ別タグ一覧 | `/next-api/quiz/category/:categoryId/tags` | `src/app/next-api/quiz/category/[categoryId]/tags/route.ts`, `src/lib/server/quizCategoryTags.ts` | 本番稼働済み | カテゴリ内の削除済みでないクイズに紐づくタグを返す |
| カテゴリ別クイズ一覧 | `/next-api/quiz/category/:categoryId/quizzes` | `src/app/next-api/quiz/category/[categoryId]/quizzes/route.ts`, `src/lib/server/quizCategoryQuizzes.ts` | 本番稼働済み | `q`, `tagSlug` 対応 |
| クイズ詳細/本体CRUD | `/next-api/quiz`, `/next-api/quiz/:quizId` | `src/app/next-api/quiz/route.ts`, `src/app/next-api/quiz/[quizId]/route.ts`, `src/lib/server/quizDetail.ts` | 本番稼働済み | 作成は Bearer JWT 必須。更新/削除は `editor` 以上。`quiz`, `quiz_choice`, `quiz_tagging` をトランザクションで処理 |
| クイズ履歴 | `/next-api/quiz/history`, `/next-api/quiz/history/sync` | `src/app/next-api/quiz/history/*`, `src/lib/server/quizHistory.ts` | 本番稼働済み | Bearer JWT 必須。履歴取得、回答追加、ローカル履歴同期をMySQLで処理 |
| クイズCSV | `/next-api/quiz/csv/sample`, `/next-api/quiz/csv/export`, `/next-api/quiz/csv/import` | `src/app/next-api/quiz/csv/*`, `src/lib/server/quizCsv.ts` | 本番稼働済み | sampleは認証なし。export/importは Bearer JWT 必須でExpress現状に合わせてeditor制限なし |
| ユーザー登録/管理 | `/next-api/users`, `/next-api/users/:userId` | `src/app/next-api/users/*`, `src/lib/server/users.ts` | 本番稼働済み | 登録は認証なし。管理GET/PATCH/DELETEは `admin` 必須 |
| 認証 | `/next-api/auth/login`, `/next-api/auth/me`, `/next-api/auth/google`, `/next-api/auth/google/callback` | `src/app/next-api/auth/*`, `src/lib/server/authAccount.ts` | 本番稼働済み | login/me と Google OAuth をNext.js側で処理 |
| 決済 / Stripe Webhook | `/next-api/payment/checkout`, `/next-api/payment/subscription`, `/next-api/payment/portal`, `/next-api/payment/history`, `/next-api/payment/status/:sessionId`, `/next-api/webhook/stripe` | `src/app/next-api/payment/*`, `src/app/next-api/webhook/stripe/route.ts`, `src/lib/server/payments.ts` | 本番稼働済み | Checkout、Portal、決済履歴、決済状態、WebhookをNext.js側で処理 |

## 本番確認済み

- `/next-api/site-search`
- `GET/POST /next-api/quiz/categories`
- `PUT/DELETE /next-api/quiz/categories/:categoryId`
- `GET/POST /next-api/quiz/tags`
- `GET/PUT/DELETE /next-api/quiz/tags/:tagId`
- `GET /next-api/quiz/search`
- `GET /next-api/quiz/category/:categoryId/tags`
- `GET /next-api/quiz/category/:categoryId/quizzes`
- `GET/PUT/DELETE /next-api/quiz/:quizId`
- `POST /next-api/quiz`
- `GET/POST /next-api/quiz/history`
- `POST /next-api/quiz/history/sync`
- `/next-api/quiz/csv/*`
- `POST/GET /next-api/users`
- `PATCH/DELETE /next-api/users/:userId`
- `POST /next-api/auth/login`
- `GET/PATCH /next-api/auth/me`
- `/next-api/auth/google`
- `/next-api/payment/*`
- `/next-api/webhook/stripe`

## 実装済み・デプロイ待ち

| 機能 | Next.js 側エンドポイント | 実装 | 状態 | 備考 |
|---|---|---|---|---|
| 現時点なし | - | - | - | 主要APIと決済/Stripe Webhookまで本番確認済み |

## 未移行

| 領域 | 状態 |
|---|---|
| ノート | `/api/notes` は Express 側に残存。今回対応対象外 |
| アップロード | `/api/upload/*`, `/uploads/*` は Express 側に残存。今回対応対象外 |
| 補助/開発 | `/api/auth/test-mail`, `/api-docs`, `/api-docs.json` は Express 側に残存 |

## 引き継ぎメモ

- 「移行済み」と書く場合は、Next.js 側に Route Handler またはサーバー処理があり、本番で疎通確認できているものだけにする。
- 実装したが本番確認前のものは「実装済み・デプロイ待ち」に置き、本番確認後に「移行済み」へ移す。
- 本番確認は最低限、対象の `/next-api/...` が 200 OK を返すことと、対応する画面がそのAPIを呼んでいることを確認する。
- Next.js 側の Express fallback は削除済み。今後は `/next-api/*` のレスポンスに `x-next-api-fallback` ヘッダーが出ない前提。
- 残存rewriteが Express 側で処理されているか確認したい場合は、レスポンスヘッダーの `X-Powered-By: Express` が参考になる。

## 認証・権限マップ

Express 側は `backend/src/routes/*.ts` の `authMiddleware`, `adminMiddleware`, `requireRole(...)` を見ると権限が分かる。Next.js 側は `src/app/next-api/.../route.ts` 内で `verifyAuth()` / `requireRole()` を呼ぶ方式。

| 領域 | Express 側の権限 | Next.js 移行後の扱い |
|---|---|---|
| 公開クイズGET | 認証なし | 認証なし |
| `GET /api/quiz/tags/:tagId` | `authMiddleware` + `requireRole('editor')` | `/next-api/quiz/tags/:tagId` で `verifyAuth()` + `requireRole(user, 'editor')` |
| `GET /api/quiz/history` | `authMiddleware` | `/next-api/quiz/history` で `verifyAuth()` |
| `POST /api/quiz/history`, `/api/quiz/history/sync` | `authMiddleware` | `/next-api/quiz/history`, `/next-api/quiz/history/sync` で `verifyAuth()` |
| `POST /api/quiz/categories`, `PUT/DELETE /api/quiz/categories/:id` | `authMiddleware` + `requireRole('editor')` | `/next-api/quiz/categories`, `/next-api/quiz/categories/:categoryId` で `verifyAuth()` + `requireRole(user, 'editor')` |
| `POST /api/quiz/tags`, `PUT/DELETE /api/quiz/tags/:tagId` | `authMiddleware` + `requireRole('editor')` | `/next-api/quiz/tags`, `/next-api/quiz/tags/:tagId` で `verifyAuth()` + `requireRole(user, 'editor')` |
| `PUT/DELETE /api/quiz/:quizId` | `authMiddleware` + `requireRole('editor')` | `/next-api/quiz/:quizId` で `verifyAuth()` + `requireRole(user, 'editor')` |
| `POST /api/quiz` | `authMiddleware` | `/next-api/quiz` で `verifyAuth()`。Express現状に合わせてeditor制限なし |
| `/api/quiz/csv/sample` | 認証なし | `/next-api/quiz/csv/sample` で認証なし |
| `/api/quiz/csv/export`, `/api/quiz/csv/import` | `authMiddleware` | `/next-api/quiz/csv/export`, `/next-api/quiz/csv/import` で `verifyAuth()`。Express現状に合わせてeditor制限なし |
| `POST /api/users` | 認証なし | `/next-api/users` で認証なし |
| `/api/users` GET/PATCH/DELETE | `authMiddleware` + `adminMiddleware` | `/next-api/users`, `/next-api/users/:userId` で `verifyAuth()` + `requireRole(user, 'admin')` |
| `POST /api/auth/login` | 認証なし | `/next-api/auth/login` で認証なし |
| `GET/PATCH /api/auth/me` | `authMiddleware` | `/next-api/auth/me` で `verifyAuth()` |
| `/api/auth/google`, `/api/auth/google/callback` | Passport Google OAuth | `/next-api/auth/google`, `/next-api/auth/google/callback` で自前OAuth処理 |
| `/api/payment/...` | `authMiddleware` | `/next-api/payment/...` で `verifyAuth()` |
| `/api/webhook/stripe` | Stripe署名検証 | `/next-api/webhook/stripe` で raw body + Stripe署名検証 |

注: `requireRole('editor')` は `editor` と `admin` を許可する。Expressの定義は `backend/src/middleware/requireRole.ts`、Next.jsの定義は `src/lib/server/auth.ts`。

## 当面の方針

1. notes/upload は今回対応しない。
2. `/api/notes/*`, `/api/upload/*`, `/uploads/*` を残すか削除するかを別途決める。
3. Express を完全に消す段階で、`backend` サービス、関連env、Nginx/docker-compose、health check、ロールバック手順を更新する。

## Express 廃止を再開する場合の進め方

### Phase 1: 残存Express APIの棚卸し

- `/api/notes`, `/api/upload/*`, `/uploads/*`, `/api/auth/test-mail`, `/api-docs`, `/api-docs.json` の扱いを決める。
- Express 側に残っている legacy API を削除してよいか、本番アクセスログや管理画面操作で確認する。

### Phase 2: `/api` の所有者変更

- Next.js 側の `/api/*` 全体rewriteは削除済み。残っている個別rewriteを削除または別パスへ分離する。
- Express に残すAPIがある場合は `/legacy-api/...` などに分離する。
- 本番の Nginx / docker-compose / health check / 環境変数を更新する。

### Phase 3: Express コンテナ廃止

- `backend` サービスを docker-compose から削除する。
- uploads の保存先をExpress外へ移す場合は、参照URLと配信方法も合わせて更新する。
- 本番デプロイ手順とロールバック手順を更新する。

## 注意点

- 旧メモにあった「TypeORM 1.0.0 追加」「`app/api/quiz/search/route.ts` 作成」「`lib/datasource.ts` 作成」は、現在のコードでは確認できない。
- Next.js側はORMなし。TypeORM用デコレータ設定も削除済み。
- 本番側のリバースプロキシが `/api/*` をExpressへ直接流している場合、Next.jsのrewrite変更だけでは `/api` の本番到達先は変わらない。本番Nginx設定も別途確認する。

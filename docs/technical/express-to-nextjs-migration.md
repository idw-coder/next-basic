# Express → Next.js API 移行計画

> 状態（2026-08-08）: 古い移行計画。現在の `next.config.ts` は `/api/*` を Express バックエンドへプロキシし、Next.js 側のAPIは `/next-api/*` に置く方針になっている。`package.json` に TypeORM / mysql2 は無く、本文の「完了済みの作業」も現在のコードとは一致しない。再開する場合は、この文書をそのまま実行せず現状調査からやり直す。

## 現在の構成

```
docker-compose
├── next.js      （フロント + SSR）  port:3000
├── express      （API サーバー）     port:8888
├── mysql 8.4    （DB）              port:3306
├── vue.js       （管理画面、Express の public に同梱）
└── postfix      （メール送信）
```

- ローカル開発: Next.js と Express を `npm run dev` で個別起動、MySQL は Docker
- 本番（Lightsail）: 全サービスを `docker-compose.prod.yml` で起動

## 移行の目的

- Docker コンテナ数を削減（Express コンテナを廃止）
- Next.js の Server Component から DB を直接参照し、不要な HTTP ラウンドトリップを排除
- デプロイ・運用の簡素化

## Express 側のルート一覧と移行難易度

| ルート | 認証 | 移行難易度 | 備考 |
|--------|------|-----------|------|
| `/api/quiz/search` | 不要 | 低 | |
| `/api/quiz/categories` (CRUD) | GET 不要 / 他は要 | 低 | |
| `/api/quiz/tags` (CRUD) | GET 不要 / 他は要 | 低 | |
| `/api/quiz/category/:id/quizzes` | 不要 | 低 | |
| `/api/quiz/category/:id/tags` | 不要 | 低 | |
| `/api/quiz/:quizId` (CRUD) | GET 不要 / PUT,DELETE は editor | 低 | |
| `/api/quiz/csv/*` | export/import は要 | 低 | |
| `/api/quiz/history/*` | 要 | 低 | |
| `/api/auth/login` | 不要 | 低 | JWT 発行 |
| `/api/auth/me` | 要 | 低 | |
| `/api/auth/google*` | 不要 | **高** | Passport → NextAuth or 自前 OAuth |
| `/api/users` | 要（admin） | 低 | |
| `/api/notes` (CRUD) | 要 | 低 | |
| `/api/upload/:category` | 要 | **中** | multer → formData 書き換え |
| `/api/payment/*` | 要 | 中 | Stripe 連携 |
| `/api/webhook/stripe` | 不要（Stripe 署名検証） | **中** | raw body 処理が必要 |

## 移行方針

### フェーズ 1: quiz 系ルートの移行（Server Component 直接呼び出し）

Next.js の Server Component から TypeORM リポジトリを直接呼び出す方式に段階的に移行する。
Route Handler（`app/api/...`）を HTTP プロキシとして経由するのではなく、
DB ロジックを共通関数として切り出し、Server Component と Route Handler の両方から使える形にする。

### フェーズ 2: 認証系の移行

- JWT 検証ヘルパー（`lib/auth.ts`）は作成済み
- Google OAuth は Passport から NextAuth.js への置き換えを検討

### フェーズ 3: その他ルートの移行

- ファイルアップロード（multer → Web API formData）
- Stripe Webhook（raw body 処理）
- メール送信

### フェーズ 4: Express コンテナ廃止

- Vue.js 管理画面の配信先を決定（別コンテナ or Next.js の static 配信）
- docker-compose から backend サービスを削除

## 完了済みの作業

### Step 1: パッケージ追加
- `typeorm` を 1.0.0 に更新（0.3.x → 1.0.0、2026-05-19 リリースの最新版）
- `reflect-metadata`, `mysql2`, `jsonwebtoken` は既存

### Step 2: tsconfig.json 修正
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```
TypeORM のデコレータ（`@Entity`, `@Column` 等）に必要。

### Step 3: next.config.ts 修正
```typescript
serverExternalPackages: ["typeorm", "mysql2"]
```
TypeORM が全 DB ドライバを内包しており、webpack が不要なドライバ（expo-sqlite 等）まで
解決しようとするのを防ぐ。

### Step 4: エンティティのコピーと循環参照修正
Express 側から以下をコピー:
- `Quiz.ts`, `QuizCategory.ts`, `QuizChoice.ts`, `QuizTag.ts`, `QuizTagging.ts`

循環参照対策として修正:
- `import { QuizChoice }` → `import type { QuizChoice }`
- `@OneToMany(() => QuizChoice, ...)` → `@OneToMany('QuizChoice', 'quiz')`
- `@ManyToOne(() => Quiz, ...)` → `@ManyToOne('Quiz', 'choices')`

webpack の ESM 解決が厳密なため、Express（CommonJS）では問題なかった循環 import が
エラーになる。`import type` は実行時に消え、文字列参照はTypeORM 内部で解決されるため回避できる。

### Step 5: lib/datasource.ts 作成
- TypeORM DataSource のシングルトン管理
- `globalThis` にキャッシュして dev 時の HMR で接続が増殖しないようにする
- `.env.local` に `DB_HOST=localhost` を設定（ローカル開発ではコンテナ名 `mysql` が解決できないため）

### Step 6: search ルート作成・動作確認
- `app/api/quiz/search/route.ts` を作成
- `GET /api/quiz/search` が正常にデータを返すことを確認

## 次のステップ

- categories GET / tags GET を Server Component から直接呼び出す形で実装
- 検索ページ（`/search`）の `page.tsx` から Express への fetch を除去し、DB 直接参照に切り替え
- 動作確認後、他の quiz 系ルートに展開

## ハマったポイントまとめ

| 問題 | 原因 | 解決策 |
|------|------|--------|
| デコレータの型エラー (TS1240) | `experimentalDecorators` 未設定 | tsconfig.json に追加 |
| `Can't resolve 'expo-sqlite'` | webpack が TypeORM の全ドライバを解決しようとする | `serverExternalPackages` に追加 |
| `Cannot access 'Quiz' before initialization` | Quiz ↔ QuizChoice の循環 import | `import type` + デコレータ文字列参照 |
| `getaddrinfo ENOTFOUND mysql` | ローカルではコンテナ名が解決できない | `.env.local` で `DB_HOST=localhost` |
| `Entity metadata for Quiz#choices was not found` | datasource の entities に QuizChoice が未登録 | entities 配列に追加 |
| `relations` の型エラー (TS2559) | TypeORM 1.0.0 で文字列配列が非推奨 | `relations: { quizTag: true }` に変更 |

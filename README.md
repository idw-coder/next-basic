# ウェブエンジニア問題集

ウェブエンジニア向けの無料学習サイト。公開URLは https://study.ntorelabo.com 。

- **教科書**（`/books`）: MDXで書いた章を Velite でビルドして表示する
- **クイズ**（`/quiz`）: MySQL に保存した問題を出題する
- **ログイン**: Google・Microsoft のOAuth。セッションは `session` テーブルと httpOnly cookie で管理する
- **決済**（`/payment`）: Stripe のサブスクリプション（準備中。`STRIPE_CHECKOUT_ENABLED` で切り替える）

## 技術スタック

- Next.js 16（App Router、webpack ビルド、`output: 'standalone'`）
- React 19 / TypeScript
- Tailwind CSS 4、MUI、Mantine
- Velite（`content/books` のMDX → `.velite/`）
- MySQL 8.4（`mysql2`）
- Stripe

## ローカルで動かす

Node.js 24 を使う（Dockerfile と同じ）。

1. 依存パッケージを入れる

   ```bash
   npm ci
   ```

2. `.env.example` を `.env.local` にコピーして値を埋める

3. MySQL を起動する。`docker-compose.yml` は1つ上のディレクトリにある

   ```bash
   docker compose -f ../docker-compose.yml up -d mysql
   ```

4. devサーバーを起動する

   ```bash
   npm run dev
   ```

   http://localhost:3000 を開く。

**devサーバーは1つだけ起動する。** `npm run dev`・`npm run build`・`npx velite` はどれも `.velite/` を書き換えるため、2つ同時に動かすと `.velite/chapters.json` が壊れて全ページが500になる。手順と復旧方法は [AGENTS.md](AGENTS.md) にある。

## コマンド

| コマンド                | 内容                                         |
| ----------------------- | -------------------------------------------- |
| `npm run dev`           | Velite を実行してから devサーバーを起動する  |
| `npm run build`         | Velite を実行してから本番ビルドする          |
| `npm run start`         | ビルド済みのアプリを起動する                 |
| `npm run lint`          | ESLint                                       |
| `npm run check:content` | `content/books` のMDXを検査する              |
| `npx tsc --noEmit`      | 型チェック                                   |

## ディレクトリ

| パス            | 内容                                                 |
| --------------- | ---------------------------------------------------- |
| `src/app`       | ページと API（`src/app/api`）                        |
| `src/proxy.ts`  | リクエストごとに実行する処理（旧 `middleware.ts`）   |
| `src/lib`       | 共通処理。サーバー専用のものは `src/lib/server`      |
| `content/books` | 教科書のMDX。1冊が1ディレクトリ                      |
| `db/migrations` | スキーマ変更のSQL                                    |
| `docs`          | 仕様・運用メモ。入口は [docs/README.md](docs/README.md) |

## デプロイ

`main` に push すると GitHub Actions（[.github/workflows/deploy.yml](.github/workflows/deploy.yml)）が次を実行する。

1. Docker イメージをビルドして GHCR に push する
2. Lightsail に SSH で入り、`docker compose pull` と `up -d` で `nextjs` コンテナを入れ替える

`NEXT_PUBLIC_*` の値はビルド時に埋め込むため、GitHub の Secrets から `build-args` で渡している。

## ドキュメント

- 作業ルール: [AGENTS.md](AGENTS.md)
- 教科書の仕様と執筆ルール: [docs/books/guide.md](docs/books/guide.md)
- そのほか: [docs/README.md](docs/README.md)

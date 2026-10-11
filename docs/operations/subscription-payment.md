# サブスクリプション決済機能 仕様書

最終確認日: 2026-10-10

## 概要

Stripe Checkout を利用したサブスクリプション決済機能のフロントエンド実装。
Next.js Route Handler の `/next-api/payment/*` エンドポイントと連携し、プラン選択 → Stripe Checkout → 結果表示の一連のフローを提供する。

> **現在のステータス: 準備中（サーバー側の環境変数で制御）**
> `STRIPE_CHECKOUT_ENABLED=true` でない限り、`/next-api/payment/subscription` は 503 を返し、Pro プランのボタンも disabled になる。admin ロールのユーザーだけは常に申し込める（本番での動作確認用）。

---

## 技術スタック

| ライブラリ | バージョン | 用途 |
|---|---|---|
| `@stripe/stripe-js` | ^9.0.0 | Stripe.js クライアントSDK |
| `@stripe/react-stripe-js` | ^6.0.0 | React用Stripeコンポーネント |
| Next.js (App Router) | 15.5.x | ルーティング・SSR |
| `fetchNextApiJson` (`src/lib/nextApiClient.ts`) | - | Next.js API通信 |

---

## ページ構成

### ルーティング

| パス | ファイル | 種別 | 説明 |
|---|---|---|---|
| `/payment` | `src/app/payment/page.tsx` | Server Component | メタデータ定義、SubscriptionClient を描画 |
| `/payment` | `src/app/payment/SubscriptionClient.tsx` | Client Component | プラン一覧・サブスク申込・ポータル遷移 |
| `/payment/success` | `src/app/payment/success/page.tsx` | Client Component | 決済完了画面 |
| `/payment/cancel` | `src/app/payment/cancel/page.tsx` | Client Component | 決済キャンセル画面 |

### ナビゲーション

- `src/components/HeaderNav.tsx` にプランリンク（CreditCard アイコン）を追加
- トップページ `src/app/page.tsx` のお知らせ欄に準備中メッセージを追加（NEW バッジ付き、`/payment` へのリンク）

---

## プラン定義

`SubscriptionClient.tsx` 内の `PLANS` 定数で管理。

| プランID | プラン名 | 価格 | 課金間隔 | サーバーに送る `plan` | Stripe Price ID（サーバーの環境変数） |
|---|---|---|---|---|---|
| `free` | フリー | ¥0 | 永久無料 | なし | なし |
| `pro-monthly` | Pro（月額） | ¥980 | 月 | `pro_monthly` | `STRIPE_PRO_MONTHLY_PRICE_ID` |
| `pro-yearly` | Pro（年額） | ¥7,980 | 年 | `pro_yearly` | `STRIPE_PRO_YEARLY_PRICE_ID` |

クライアントは Price ID を持たず、プラン名（`plan`）だけを送る。Price ID への変換は `src/lib/server/payments.ts` の `PLAN_PRICE_ENV` で行う。
クライアントから Price ID を受け取ると、同じ Stripe アカウント内の別の価格（テスト用の安い価格など）で加入できてしまうため。

### プラン別機能

| 機能 | フリー | Pro |
|---|---|---|
| 全カテゴリのクイズ | o | o |
| 解答履歴の閲覧 | o | o |
| ランダムクイズ | o | o |
| キーワード検索 | o | o |
| 詳細な学習分析 | - | o |
| 広告の非表示 | - | o |
| 優先サポート | - | o |
| AI による弱点分析 | - | o |
| 2ヶ月分お得（年額のみ） | - | o |

---

## 画面仕様

### `/payment` — プラン一覧ページ

#### 構成要素

1. **準備中バナー**
   - アンバー系のアラートボックス
   - Construction アイコン + 「現在準備中です」のメッセージ
   - サブスクリプション機能が開発中であることを案内

2. **ヘッダー**
   - 「プラン一覧」バッジ（Crown アイコン）
   - タイトル「あなたに合ったプランを選ぼう」
   - 説明テキスト

3. **プランカード（3カラム Grid）**
   - フリー: Star アイコン、グレー基調、「問題を解く」ボタン（`/#categories` へ遷移）
   - Pro月額: Zap アイコン、ブルー基調、「おすすめ」バッジ付き、ボタンは「準備中」（disabled）
   - Pro年額: Crown アイコン、バイオレット基調、ボタンは「準備中」（disabled）
   - 各プランに機能一覧をチェックマーク付きリストで表示

4. **FAQ セクション**
   - 4件のQ&A（無料利用・解約・支払い方法・返金ポリシー）

5. **サブスクリプション管理（ログイン時のみ表示）**
   - Shield アイコン
   - 「管理ポータルを開く」ボタン → Stripe Billing Portal へリダイレクト

#### インタラクション

| アクション | 条件 | 動作 |
|---|---|---|
| フリー「問題を解く」クリック | なし | `/#categories` へ遷移 |
| Pro プランのボタン | 受付停止中、またはそのプランの Price ID が未設定 | disabled（「準備中」） |
| Pro プランのボタン | 受付中 & 未ログイン | `/login` へリダイレクト |
| Pro プランのボタン | 受付中 & ログイン済 | `POST /next-api/payment/subscription` → Stripe Checkout URL へリダイレクト |
| 「管理ポータルを開く」 | ログイン済 | `POST /next-api/payment/portal` → Stripe Billing Portal URL へリダイレクト |

#### 受付中かどうかの制御

判定はサーバー側で行う。画面はマウント時に `GET /next-api/payment/config` を呼び、その結果で表示を切り替える。
画面の表示はあくまで見た目で、実際の制御は `/next-api/payment/subscription` 側の判定（受付停止中は 503）。

| 条件 | `checkoutEnabled` | バナー | 有料プランボタン |
|---|---|---|---|
| `STRIPE_CHECKOUT_ENABLED` が `true` 以外 & 一般ユーザー・未ログイン | `false` | 表示 | disabled（「準備中」） |
| `STRIPE_CHECKOUT_ENABLED` が `true` 以外 & admin | `true` | 非表示 | 有効 |
| `STRIPE_CHECKOUT_ENABLED=true` | `true` | 非表示 | 有効 |

- `plans.pro_monthly` / `plans.pro_yearly` が `false`（Price ID 未設定）のプランは、受付中でも「準備中」になる
- config の取得中や取得失敗時は「準備中」として扱う
- Webhook（`/next-api/webhook/stripe`）とカスタマーポータル（`/next-api/payment/portal`）はこのフラグの影響を受けない。既存の加入者が解約や支払い方法の変更をできるようにするため

> 以前は `?mode=stripeActive` で画面側だけを有効化していたが、API は誰でも直接呼べる状態だったため、2026-10-10 にサーバー側の判定へ置き換えた。

---

### `/payment/success` — 決済完了ページ

#### 表示内容

- 成功アイコン（緑の CheckCircle2）
- 「お支払い完了」タイトル
- サブスクリプション有効化メッセージ
- 金額表示（`payment.amount > 0` の場合）
- 「学習を始める」ボタン → `/#categories`
- 「プラン一覧に戻る」ボタン → `/payment`

#### データ取得

- URL パラメータ `session_id` を使用
- `GET /next-api/payment/status/{session_id}` でステータスを確認
- 取得失敗でもエラー表示はしない（Stripe 側で成功しているため）

---

### `/payment/cancel` — 決済キャンセルページ

#### 表示内容

- キャンセルアイコン（グレーの XCircle）
- 「お支払いがキャンセルされました」タイトル
- 決済未実施のメッセージ
- 「プラン一覧に戻る」ボタン → `/payment`
- 「問題を解く」ボタン → `/#categories`

---

## フロントエンド ↔ バックエンド API 連携

### 使用するエンドポイント

| API | メソッド | 認証 | フロントからの呼び出し箇所 | 説明 |
|---|---|---|---|---|
| `/next-api/payment/config` | GET | 任意 | SubscriptionClient（マウント時） | 受付中かどうかと、利用できるプランを返す |
| `/next-api/payment/subscription` | POST | Bearer | SubscriptionClient `handleSubscribe` | サブスクリプション Checkout Session を作成 |
| `/next-api/payment/portal` | POST | Bearer | SubscriptionClient `handlePortal` | Stripe Billing Portal セッションを作成 |
| `/next-api/payment/status/:sessionId` | GET | Bearer | success/page.tsx | 決済ステータスを確認 |

### リクエスト・レスポンス

#### 受付状況の取得

```
GET /next-api/payment/config
Authorization: Bearer <token>   ※ 任意。admin 判定に使う

Response (200):
{
  "checkoutEnabled": false,
  "plans": { "pro_monthly": true, "pro_yearly": true }
}
```

#### サブスクリプション開始

```
POST /next-api/payment/subscription
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "plan": "pro_monthly"   // "pro_monthly" | "pro_yearly"
}

Response (200):
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_..."
}

Error:
  400 … plan が不正
  503 … 受付停止中（STRIPE_CHECKOUT_ENABLED が true 以外で、admin でもない）、または Price ID 未設定
```

#### ポータル表示

```
POST /next-api/payment/portal
Authorization: Bearer <token>

Response (200):
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

#### 決済ステータス確認

```
GET /next-api/payment/status/:sessionId
Authorization: Bearer <token>

Response (200):
{
  "payment": {
    "id": 1,
    "status": "completed",
    "amount": 980,
    "currency": "jpy",
    ...
  }
}
```

---

## 決済フロー（シーケンス）

```
[ユーザー]          [Next.js フロント]         [Next.js Route Handler]       [Stripe]
    |                      |                          |                        |
    |  プランを選択         |                          |                        |
    |--------------------->|                          |                        |
    |                      |  POST /subscription      |                        |
    |                      |  { plan }                |                        |
    |                      |------------------------->|                        |
    |                      |                          |  Customer 取得/作成     |
    |                      |                          |----------------------->|
    |                      |                          |<-----------------------|
    |                      |                          |                        |
    |                      |                          |  Checkout Session 作成  |
    |                      |                          |----------------------->|
    |                      |                          |<-----------------------|
    |                      |                          |                        |
    |                      |                          |  Payment 保存 (pending)|
    |                      |                          |                        |
    |                      |  { url, sessionId }      |                        |
    |                      |<-------------------------|                        |
    |                      |                          |                        |
    |  Stripe Checkout へ  |                          |                        |
    |  リダイレクト         |                          |                        |
    |------------------------------------------------------------->|           |
    |                      |                          |            | カード入力 |
    |                      |                          |            | 決済処理   |
    |                      |                          |            |           |
    |  /payment/success    |                          | Webhook    |           |
    |  へリダイレクト       |                          |<-----------|           |
    |<-------------------------------------------------------------|           |
    |                      |                          |                        |
    |                      |  GET /status/:sessionId  | Payment → completed   |
    |                      |------------------------->|                        |
    |                      |<-------------------------|                        |
    |  完了画面表示         |                          |                        |
    |<---------------------|                          |                        |
```

---

## 環境変数

### ビルド時（`NEXT_PUBLIC_*`、GitHub Secrets → Dockerfile の ARG）

| 変数名 | 必須 | 説明 |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | - | Stripe 公開鍵（将来 Elements 利用時に必要） |

### 実行時（Next.js サーバー。本番は `/var/www/app/nextjs/.env`）

ビルドし直さなくても、`.env` を書き換えてコンテナを再作成するだけで反映される。

| 変数名 | 必須 | 説明 |
|---|---|---|
| `STRIPE_CHECKOUT_ENABLED` | - | `true` のときだけ一般ユーザーが申し込める。未設定なら受付停止（admin のみ可） |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | o | Pro月額プランの Stripe Price ID |
| `STRIPE_PRO_YEARLY_PRICE_ID` | o | Pro年額プランの Stripe Price ID |
| `STRIPE_SECRET_KEY` | o | Stripe シークレットキー |
| `STRIPE_WEBHOOK_SECRET` | o | Stripe Webhook 署名検証用シークレット |
| `FRONTEND_URL` | o | フロントエンドのURL（リダイレクト先） |

---

## データモデル（バックエンド）

### User テーブル（関連カラム）

| カラム | 型 | 説明 |
|---|---|---|
| `stripeCustomerId` | `VARCHAR(255) NULL UNIQUE` | Stripe 顧客 ID (`cus_xxx`) |

### Payment テーブル

| カラム | 型 | 説明 |
|---|---|---|
| `id` | `BIGINT UNSIGNED PK` | 主キー |
| `userId` | `BIGINT UNSIGNED FK` | User への外部キー |
| `stripeSessionId` | `VARCHAR(255) UNIQUE` | Checkout Session ID / `inv_{invoice.id}` |
| `stripePaymentIntentId` | `VARCHAR(255) NULL` | PaymentIntent ID |
| `status` | `VARCHAR(50)` | `pending` / `completed` / `failed` / `expired` |
| `amount` | `INT UNSIGNED` | 決済金額（最小通貨単位） |
| `currency` | `VARCHAR(10)` | 通貨コード（デフォルト `jpy`） |
| `description` | `VARCHAR(255) NULL` | `subscription` / `subscription_renewal` |
| `createdAt` | `DATETIME` | 作成日時 |
| `updatedAt` | `DATETIME` | 更新日時 |

### ステータス遷移

```
pending ──(checkout.session.completed)──> completed
pending ──(checkout.session.expired)───> expired
pending ──(payment_intent.payment_failed)──> failed
```

---

## Webhook イベント処理（バックエンド参照）

| イベント | 処理内容 |
|---|---|
| `checkout.session.completed` | Payment → `completed`、金額・通貨・PaymentIntent ID を更新 |
| `checkout.session.expired` | Payment → `expired` |
| `payment_intent.payment_failed` | Payment → `failed` |
| `customer.subscription.deleted` | ログ出力 |
| `invoice.payment_succeeded` | 2回目以降の定期課金を Payment に新規記録 |
| `invoice.payment_failed` | ログ出力 |

---

## ファイル一覧

### 新規作成

| ファイル | 説明 |
|---|---|
| `src/app/payment/page.tsx` | プラン一覧ページ（Server Component、メタデータ） |
| `src/app/payment/SubscriptionClient.tsx` | プラン一覧・申込ロジック（Client Component） |
| `src/app/payment/success/page.tsx` | 決済完了ページ |
| `src/app/payment/cancel/page.tsx` | 決済キャンセルページ |

### 変更

| ファイル | 変更内容 |
|---|---|
| `src/app/page.tsx` | NEWS 配列にサブスクリプション準備中メッセージを追加、リンク付きニュース対応 |
| `src/components/HeaderNav.tsx` | 「プラン」ナビゲーションリンクを追加（CreditCard アイコン） |

---

## ローカル開発・動作確認手順

### 1. Stripe ダッシュボードで商品・価格を作成

1. [Stripe Dashboard](https://dashboard.stripe.com/) にテストモードでログイン
2. **Product catalog** → **Add product** で以下の2つを作成

| 商品名 | 価格 | 課金間隔 |
|---|---|---|
| Pro（月額） | ¥980 | Monthly (recurring) |
| Pro（年額） | ¥7,980 | Yearly (recurring) |

3. 各 Price の詳細画面に表示される **Price ID**（`price_xxxxxxxx`）をメモ

### 2. Next.js の環境変数を設定

`next-basic/.env.local` に以下を設定:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxx        # Stripe Dashboard → Developers → API keys → Secret key
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx      # 手順 4 で Stripe CLI から取得
FRONTEND_URL=http://localhost:3000
```

### 3. Price ID と受付フラグを設定

`next-basic/.env.local` に以下を追記:

```env
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxxxxx   # 手順 1 の月額 Price ID
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxxxxx    # 手順 1 の年額 Price ID
# STRIPE_CHECKOUT_ENABLED=true               # 一般ユーザーでも試すときだけ有効にする
```

### 4. Stripe CLI でローカル Webhook を転送

Webhook がないと決済完了後に Payment ステータスが `pending` のまま更新されない。

```bash
# Stripe CLI のインストール（未インストールの場合）
brew install stripe/stripe-cli/stripe

# Stripe にログイン
stripe login

# Webhook イベントをローカルのNext.jsに転送
stripe listen --forward-to localhost:3000/next-api/webhook/stripe
```

ターミナルに表示される `whsec_xxxxxxxx` を `next-basic/.env.local` の `STRIPE_WEBHOOK_SECRET` に設定する。

### 5. 起動

3つのターミナルで以下を起動:

```bash
# ターミナル 1: Next.js
cd next-basic && npm run dev

# ターミナル 2: Stripe CLI（手順 4 で起動済み）
```

### 6. 動作確認

1. `STRIPE_CHECKOUT_ENABLED` を設定しない状態で、一般ユーザーでログイン
2. `http://localhost:3000/payment` にアクセス → 「準備中」バナーが表示され、有料プランボタンが disabled であることを確認
3. 同じ一般ユーザーのトークンで `POST /next-api/payment/subscription` を直接呼ぶ → 503 が返ることを確認
4. admin ユーザーでログインし直して `/payment` にアクセス → バナーが消え、有料プランボタンが有効になることを確認
5. Pro プランの「このプランを選ぶ」をクリック
6. Stripe Checkout 画面で**テストカード**を入力:
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 任意の未来日（例: `12/30`）
   - CVC: 任意の3桁（例: `123`）
7. 決済完了 → `/payment/success` にリダイレクトされることを確認
8. Stripe CLI のターミナルに `checkout.session.completed` イベントが表示されることを確認
9. `{"plan":"pro_monthly"}` 以外（例: `{"plan":"x"}` や `{"priceId":"price_..."}`）を送る → 400 が返ることを確認

> `.env.local` は `.gitignore` に含まれるため、そのまま残して問題ない。

---

## 正式リリース時の対応事項

### 1. Stripe ダッシュボードで商品・価格を作成

本番モード（Live）で月額・年額の Price を作成し、Price ID（`price_xxx`）を取得する。

### 2. 本番の `.env` に Price ID を設定し、受付を開始する

本番サーバーの `/var/www/app/nextjs/.env` に追記する。ビルドし直す必要はない。

```env
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx   # 手順 1 の Live の Price ID
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
STRIPE_SECRET_KEY=sk_live_xxx           # テスト用キーから Live のキーに差し替える
STRIPE_CHECKOUT_ENABLED=true            # 先に admin で動作確認してから入れる
```

コンテナを再作成して反映する（`docker compose -f docker-compose.prod.yml up -d nextjs`）。
受付を止めたいときは `STRIPE_CHECKOUT_ENABLED` を消して再作成するだけでよい。

### 3〜5. （不要になった手順）

以前は Price ID を `NEXT_PUBLIC_*` としてビルド時に埋め込み、画面側のフラグ（`?mode=stripeActive`）を外す手順があった。
Price ID のサーバー管理と受付フラグのサーバー判定に置き換えたため、Dockerfile・deploy.yml・`SubscriptionClient.tsx` の変更は不要。
GitHub Secrets に残っている `NEXT_PUBLIC_STRIPE_PRO_*_PRICE_ID` は使われていないので削除してよい。

### 6. トップページのお知らせを更新

`src/app/page.tsx` の NEWS 配列で準備中メッセージを正式リリースメッセージに差し替える。

### 7. Webhook エンドポイントを本番環境に登録

Stripe Dashboard → **Developers** → **Webhooks** でエンドポイントを追加:

- URL: `https://<本番ドメイン>/next-api/webhook/stripe`
- 監視イベント: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

発行された署名シークレットを本番 Next.js コンテナの `STRIPE_WEBHOOK_SECRET` に設定し、コンテナを再作成する。

### 8. テストカードで動作確認

本番デプロイ前にステージング環境またはテストモードで `4242 4242 4242 4242` を使って一連のフローを確認する。

---

## 今後の拡張検討事項

- [ ] Pro プラン契約状況のフロントエンド表示（プロフィールページ等）
- [ ] Pro ユーザーへの広告非表示制御
- [ ] 学習分析ダッシュボード（Pro 限定機能）
- [ ] AI 弱点分析機能の実装
- [ ] 決済履歴ページ (`/payment/history`) の実装
- [ ] 返金処理の UI
- [ ] サブスクリプション更新・ダウングレードのフロー
- [ ] メール通知（決済完了・更新・失敗時）

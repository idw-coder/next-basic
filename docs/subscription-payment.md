# サブスクリプション決済機能 仕様書

## 概要

Stripe Checkout を利用したサブスクリプション決済機能のフロントエンド実装。
バックエンドの `/api/payment/*` エンドポイントと連携し、プラン選択 → Stripe Checkout → 結果表示の一連のフローを提供する。

> **現在のステータス: 準備中**
> Proプランのボタンは disabled で、正式リリースまで購入不可の状態。

---

## 技術スタック

| ライブラリ | バージョン | 用途 |
|---|---|---|
| `@stripe/stripe-js` | ^9.0.0 | Stripe.js クライアントSDK |
| `@stripe/react-stripe-js` | ^6.0.0 | React用Stripeコンポーネント |
| Next.js (App Router) | 15.5.x | ルーティング・SSR |
| Axios (`src/lib/api.ts`) | ^1.13.x | バックエンドAPI通信 |

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

| プランID | プラン名 | 価格 | 課金間隔 | Stripe Price ID（環境変数） |
|---|---|---|---|---|
| `free` | フリー | ¥0 | 永久無料 | なし |
| `pro-monthly` | Pro（月額） | ¥980 | 月 | `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID` |
| `pro-yearly` | Pro（年額） | ¥7,980 | 年 | `NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID` |

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
| Pro プランのボタン | 準備中フラグ ON | disabled（クリック不可） |
| Pro プランのボタン | 準備中フラグ OFF & 未ログイン | `/login` へリダイレクト |
| Pro プランのボタン | 準備中フラグ OFF & ログイン済 | `POST /api/payment/subscription` → Stripe Checkout URL へリダイレクト |
| 「管理ポータルを開く」 | ログイン済 | `POST /api/payment/portal` → Stripe Billing Portal URL へリダイレクト |

#### 準備中フラグの制御

`SubscriptionClient.tsx` 内の以下の行で制御:

```typescript
const isPreparing = !isFree;
```

正式リリース時にはこのフラグを条件変更（例: `false` に固定、または環境変数で制御）することで有効化する。

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
- `GET /api/payment/status/{session_id}` でステータスを確認
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
| `/api/payment/subscription` | POST | Bearer | SubscriptionClient `handleSubscribe` | サブスクリプション Checkout Session を作成 |
| `/api/payment/portal` | POST | Bearer | SubscriptionClient `handlePortal` | Stripe Billing Portal セッションを作成 |
| `/api/payment/status/:sessionId` | GET | Bearer | success/page.tsx | 決済ステータスを確認 |

### リクエスト・レスポンス

#### サブスクリプション開始

```
POST /api/payment/subscription
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "priceId": "price_xxxxxxxxxxxxx"
}

Response (200):
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

#### ポータル表示

```
POST /api/payment/portal
Authorization: Bearer <token>

Response (200):
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

#### 決済ステータス確認

```
GET /api/payment/status/:sessionId
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
[ユーザー]          [Next.js フロント]         [Express バックエンド]         [Stripe]
    |                      |                          |                        |
    |  プランを選択         |                          |                        |
    |--------------------->|                          |                        |
    |                      |  POST /subscription      |                        |
    |                      |  { priceId }             |                        |
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

### フロントエンド（Next.js）

| 変数名 | 必須 | 説明 |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | - | Stripe 公開鍵（将来 Elements 利用時に必要） |
| `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID` | o | Pro月額プランの Stripe Price ID |
| `NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID` | o | Pro年額プランの Stripe Price ID |

### バックエンド（Express）

| 変数名 | 必須 | 説明 |
|---|---|---|
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

### 2. バックエンドの環境変数を設定

`backend/.env` に以下を設定:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxx        # Stripe Dashboard → Developers → API keys → Secret key
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx      # 手順 4 で Stripe CLI から取得
FRONTEND_URL=http://localhost:3000
```

### 3. フロントエンドの環境変数を設定

`next-basic/.env.local` に以下を追記:

```env
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxxxxx   # 手順 1 の月額 Price ID
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxxxxx    # 手順 1 の年額 Price ID
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888
```

### 4. Stripe CLI でローカル Webhook を転送

Webhook がないと決済完了後に Payment ステータスが `pending` のまま更新されない。

```bash
# Stripe CLI のインストール（未インストールの場合）
brew install stripe/stripe-cli/stripe

# Stripe にログイン
stripe login

# Webhook イベントをローカルのバックエンドに転送
stripe listen --forward-to localhost:8888/api/webhook/stripe
```

ターミナルに表示される `whsec_xxxxxxxx` を `backend/.env` の `STRIPE_WEBHOOK_SECRET` に設定する。

### 5. 準備中フラグの解除

`SubscriptionClient.tsx` の `isPreparing` を一時的に変更:

```typescript
// 変更前
const isPreparing = !isFree;

// 変更後（ローカル確認用）
const isPreparing = false;
```

### 6. 起動

3つのターミナルで以下を起動:

```bash
# ターミナル 1: バックエンド
cd backend && npm run dev

# ターミナル 2: フロントエンド
cd next-basic && npm run dev

# ターミナル 3: Stripe CLI（手順 4 で起動済み）
```

### 7. 動作確認

1. `http://localhost:3000` でログイン
2. `/payment` にアクセス → Pro プランの「このプランを選ぶ」をクリック
3. Stripe Checkout 画面で**テストカード**を入力:
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 任意の未来日（例: `12/30`）
   - CVC: 任意の3桁（例: `123`）
4. 決済完了 → `/payment/success` にリダイレクトされることを確認
5. Stripe CLI のターミナルに `checkout.session.completed` イベントが表示されることを確認

### 確認後の戻し

動作確認が終わったら `isPreparing` を元に戻す:

```typescript
const isPreparing = !isFree;
```

`.env.local` は `.gitignore` に含まれるため、そのまま残して問題ない。

---

## 正式リリース時の対応事項

### 1. Stripe ダッシュボードで商品・価格を作成

本番モード（Live）で月額・年額の Price を作成し、Price ID（`price_xxx`）を取得する。

### 2. GitHub Secrets に Price ID を追加

GitHub → Settings → Secrets and variables → Actions で以下を登録:

| Secret 名 | 値 |
|---|---|
| `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID` | 月額プランの Price ID（`price_xxx`） |
| `NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID` | 年額プランの Price ID（`price_xxx`） |

### 3. Dockerfile に ARG を追加

`next-basic/Dockerfile` の既存 ARG の後に追加:

```dockerfile
ARG NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID
ARG NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID
```

### 4. deploy.yml に build-args を追加

`.github/workflows/deploy.yml` の `build-args` に追加:

```yaml
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=${{ secrets.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID }}
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=${{ secrets.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID }}
```

### 5. 準備中フラグを解除

`SubscriptionClient.tsx` の `isPreparing` ロジックを変更:

```typescript
// 変更前
const isPreparing = !isFree;

// 変更後
const isPreparing = false;
```

### 6. トップページのお知らせを更新

`src/app/page.tsx` の NEWS 配列で準備中メッセージを正式リリースメッセージに差し替える。

### 7. Webhook エンドポイントを本番環境に登録

Stripe Dashboard → **Developers** → **Webhooks** でエンドポイントを追加:

- URL: `https://<本番ドメイン>/api/webhook/stripe`
- 監視イベント: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

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

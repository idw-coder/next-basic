import Stripe from 'stripe';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import type { AuthUser } from '@/lib/server/auth';
import { getMysqlPool } from '@/lib/server/mysql';

interface PaymentUserRow extends RowDataPacket {
  id: number | string;
  name: string;
  email: string;
  stripeCustomerId: string | null;
}

interface PaymentRow extends RowDataPacket {
  id: number | string;
  userId: number | string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  status: string;
  amount: number;
  currency: string;
  description: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

type StripeInvoiceWithPaymentIntent = Stripe.Invoice & {
  payment_intent?: string | Stripe.PaymentIntent | null;
};

export interface PaymentResult {
  body: unknown;
  status: 200;
  source: 'db';
}

export class PaymentError extends Error {
  status: 400 | 404 | 503;

  constructor(message: string, status: 400 | 404 | 503) {
    super(message);
    this.name = 'PaymentError';
    this.status = status;
  }
}

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// クライアントからは Price ID を受け取らず、プラン名だけを受け取る。
// Price ID をそのまま受け付けると、同じ Stripe アカウント内の別の価格（テスト用の安い価格など）で加入できてしまうため。
const PLAN_PRICE_ENV = {
  pro_monthly: 'STRIPE_PRO_MONTHLY_PRICE_ID',
  pro_yearly: 'STRIPE_PRO_YEARLY_PRICE_ID',
} as const;

export type PlanKey = keyof typeof PLAN_PRICE_ENV;

function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === 'string' && Object.hasOwn(PLAN_PRICE_ENV, value);
}

function getPlanPriceId(plan: PlanKey): string | null {
  return process.env[PLAN_PRICE_ENV[plan]] || null;
}

// 決済の開始は STRIPE_CHECKOUT_ENABLED=true のときだけ許可する。
// 準備中でも本番で動作確認できるよう、admin は常に許可する。
function isCheckoutEnabled(user: AuthUser | null): boolean {
  return process.env.STRIPE_CHECKOUT_ENABLED === 'true' || user?.role === 'admin';
}

export function getPaymentConfig(user: AuthUser | null) {
  return {
    checkoutEnabled: isCheckoutEnabled(user),
    plans: {
      pro_monthly: getPlanPriceId('pro_monthly') !== null,
      pro_yearly: getPlanPriceId('pro_yearly') !== null,
    },
  };
}

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
}

function toIsoString(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function mapPayment(row: PaymentRow) {
  return {
    id: String(row.id),
    userId: String(row.userId),
    stripeSessionId: row.stripeSessionId,
    ...(row.stripePaymentIntentId
      ? { stripePaymentIntentId: row.stripePaymentIntentId }
      : {}),
    status: row.status,
    amount: row.amount,
    currency: row.currency,
    ...(row.description ? { description: row.description } : {}),
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
  };
}

async function getUser(userId: number): Promise<PaymentUserRow> {
  const [rows] = await getMysqlPool().query<PaymentUserRow[]>(
    `
      SELECT id, name, email, stripeCustomerId
      FROM \`user\`
      WHERE id = ?
        AND deletedAt IS NULL
      LIMIT 1
    `,
    [userId],
  );

  const user = rows[0];
  if (!user) {
    throw new PaymentError('ユーザーが見つかりません', 404);
  }

  return user;
}

async function getOrCreateStripeCustomer(user: PaymentUserRow): Promise<string> {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await getStripe().customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: String(user.id) },
  });

  await getMysqlPool().query(
    `
      UPDATE \`user\`
      SET stripeCustomerId = ?,
          updatedAt = NOW()
      WHERE id = ?
        AND deletedAt IS NULL
    `,
    [customer.id, user.id],
  );

  return customer.id;
}

async function createPendingPayment(params: {
  userId: number | string;
  stripeSessionId: string;
  description?: string;
}): Promise<void> {
  await getMysqlPool().query(
    `
      INSERT INTO payment
        (userId, stripeSessionId, status, amount, currency, description, createdAt, updatedAt)
      VALUES (?, ?, 'pending', 0, 'jpy', ?, NOW(), NOW())
    `,
    [params.userId, params.stripeSessionId, params.description ?? null],
  );
}

async function createSubscriptionSessionInDb(
  user: AuthUser,
  payload: unknown,
): Promise<PaymentResult> {
  if (!isCheckoutEnabled(user)) {
    throw new PaymentError('現在サブスクリプションの受付を停止しています', 503);
  }

  const body = payload as { plan?: unknown } | null;
  const plan = body?.plan;
  if (!isPlanKey(plan)) {
    throw new PaymentError('plan が不正です', 400);
  }

  const priceId = getPlanPriceId(plan);
  if (!priceId) {
    throw new PaymentError('現在このプランはご利用いただけません', 503);
  }

  const dbUser = await getUser(user.userId);
  const customerId = await getOrCreateStripeCustomer(dbUser);
  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${getFrontendUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getFrontendUrl()}/payment/cancel`,
    metadata: {
      userId: String(dbUser.id),
      plan,
    },
  });

  await createPendingPayment({
    userId: dbUser.id,
    stripeSessionId: session.id,
    description: 'subscription',
  });

  return {
    body: { url: session.url, sessionId: session.id },
    status: 200,
    source: 'db',
  };
}

async function createPortalSessionInDb(userId: number): Promise<PaymentResult> {
  const user = await getUser(userId);

  if (!user.stripeCustomerId) {
    throw new PaymentError('Stripe顧客情報が見つかりません', 400);
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${getFrontendUrl()}/payment`,
  });

  return {
    body: { url: session.url },
    status: 200,
    source: 'db',
  };
}

async function getPaymentHistoryFromDb(userId: number, requestUrl: string): Promise<PaymentResult> {
  const url = new URL(requestUrl);
  const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(url.searchParams.get('limit') || '20', 10) || 20),
  );
  const offset = (page - 1) * limit;

  const [rows] = await getMysqlPool().query<PaymentRow[]>(
    `
      SELECT id, userId, stripeSessionId, stripePaymentIntentId, status, amount, currency,
             description, createdAt, updatedAt
      FROM payment
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `,
    [userId, limit, offset],
  );

  const [countRows] = await getMysqlPool().query<CountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM payment
      WHERE userId = ?
    `,
    [userId],
  );

  const total = Number(countRows[0]?.total ?? 0);

  return {
    body: {
      payments: rows.map(mapPayment),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    status: 200,
    source: 'db',
  };
}

async function getPaymentStatusFromDb(
  userId: number,
  sessionId: string,
): Promise<PaymentResult> {
  const [rows] = await getMysqlPool().query<PaymentRow[]>(
    `
      SELECT id, userId, stripeSessionId, stripePaymentIntentId, status, amount, currency,
             description, createdAt, updatedAt
      FROM payment
      WHERE stripeSessionId = ?
        AND userId = ?
      LIMIT 1
    `,
    [sessionId, userId],
  );

  const payment = rows[0];
  if (!payment) {
    throw new PaymentError('決済情報が見つかりません', 404);
  }

  return {
    body: { payment: mapPayment(payment) },
    status: 200,
    source: 'db',
  };
}

export async function createSubscriptionSession(
  user: AuthUser,
  payload: unknown,
): Promise<PaymentResult> {
  try {
    return await createSubscriptionSessionInDb(user, payload);
  } catch (error) {
    if (error instanceof PaymentError) throw error;
    console.error('Failed to create subscription session in DB.', error);
    throw error;
  }
}

export async function createPortalSession(
  userId: number,
): Promise<PaymentResult> {
  try {
    return await createPortalSessionInDb(userId);
  } catch (error) {
    if (error instanceof PaymentError) throw error;
    console.error('Failed to create portal session in DB.', error);
    throw error;
  }
}

export async function getPaymentHistory(
  userId: number,
  requestUrl: string,
): Promise<PaymentResult> {
  try {
    return await getPaymentHistoryFromDb(userId, requestUrl);
  } catch (error) {
    console.error('Failed to fetch payment history from DB.', error);
    throw error;
  }
}

export async function getPaymentStatus(
  userId: number,
  sessionId: string,
): Promise<PaymentResult> {
  try {
    return await getPaymentStatusFromDb(userId, sessionId);
  } catch (error) {
    if (error instanceof PaymentError) throw error;
    console.error('Failed to fetch payment status from DB.', error);
    throw error;
  }
}

export async function handleStripeWebhook(rawBody: string, signature: string | null) {
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe webhook signature is not configured');
  }

  const event = getStripe().webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  await processStripeEvent(event);

  return { received: true };
}

async function processStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      await getMysqlPool().query(
        `
          UPDATE payment
          SET status = 'completed',
              amount = ?,
              currency = ?,
              stripePaymentIntentId = ?,
              updatedAt = NOW()
          WHERE stripeSessionId = ?
        `,
        [
          session.amount_total ?? 0,
          session.currency ?? 'jpy',
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
          session.id,
        ],
      );
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;

      await getMysqlPool().query(
        `
          UPDATE payment
          SET status = 'expired',
              updatedAt = NOW()
          WHERE stripeSessionId = ?
        `,
        [session.id],
      );
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      await getMysqlPool().query(
        `
          UPDATE payment
          SET status = 'failed',
              updatedAt = NOW()
          WHERE stripePaymentIntentId = ?
        `,
        [paymentIntent.id],
      );
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as StripeInvoiceWithPaymentIntent;

      if (invoice.billing_reason === 'subscription_create') {
        break;
      }

      const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;
      if (!customerId) {
        break;
      }

      const [users] = await getMysqlPool().query<PaymentUserRow[]>(
        `
          SELECT id, name, email, stripeCustomerId
          FROM \`user\`
          WHERE stripeCustomerId = ?
            AND deletedAt IS NULL
          LIMIT 1
        `,
        [customerId],
      );

      const user = users[0];
      if (!user) {
        break;
      }

      await getMysqlPool().query<ResultSetHeader>(
        `
          INSERT IGNORE INTO payment
            (userId, stripeSessionId, stripePaymentIntentId, status, amount, currency,
             description, createdAt, updatedAt)
          VALUES (?, ?, ?, 'completed', ?, ?, 'subscription_renewal', NOW(), NOW())
        `,
        [
          user.id,
          `inv_${invoice.id}`,
          typeof invoice.payment_intent === 'string' ? invoice.payment_intent : null,
          invoice.amount_paid ?? 0,
          invoice.currency ?? 'jpy',
        ],
      );
      break;
    }

    default:
      break;
  }
}

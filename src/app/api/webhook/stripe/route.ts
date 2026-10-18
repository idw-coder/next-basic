import { NextResponse } from 'next/server';

import { handleStripeWebhook } from '@/lib/server/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const result = await handleStripeWebhook(body, request.headers.get('stripe-signature'));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Stripe webhook failed.', error);
    return NextResponse.json({ error: 'Webhook署名の検証に失敗しました' }, { status: 400 });
  }
}

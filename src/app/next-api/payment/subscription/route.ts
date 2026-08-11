import { NextResponse } from 'next/server';

import { AuthError, verifyAuth } from '@/lib/server/auth';
import { PaymentError, createSubscriptionSession } from '@/lib/server/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    const result = await createSubscriptionSession(
      user.userId,
      await request.json(),
    );

    return NextResponse.json(result.body);
  } catch (error) {
    if (error instanceof AuthError || error instanceof PaymentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Failed to create subscription session.', error);
    return NextResponse.json(
      { error: 'サブスクリプションセッションの作成に失敗しました' },
      { status: 500 },
    );
  }
}

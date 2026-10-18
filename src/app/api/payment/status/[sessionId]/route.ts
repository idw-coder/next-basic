import { NextResponse } from 'next/server';

import { AuthError, verifyAuth } from '@/lib/server/auth';
import { PaymentError, getPaymentStatus } from '@/lib/server/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  try {
    const user = verifyAuth(request);
    const result = await getPaymentStatus(user.userId, sessionId);

    return NextResponse.json(result.body);
  } catch (error) {
    if (error instanceof AuthError || error instanceof PaymentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Failed to fetch payment status.', error);
    return NextResponse.json({ error: '決済ステータスの取得に失敗しました' }, { status: 500 });
  }
}

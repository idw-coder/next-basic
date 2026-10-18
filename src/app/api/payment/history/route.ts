import { NextResponse } from 'next/server';

import { AuthError, verifyAuth } from '@/lib/server/auth';
import { getPaymentHistory } from '@/lib/server/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);
    const result = await getPaymentHistory(user.userId, request.url);

    return NextResponse.json(result.body);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Failed to fetch payment history.', error);
    return NextResponse.json({ error: '決済履歴の取得に失敗しました' }, { status: 500 });
  }
}

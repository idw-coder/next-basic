import { NextResponse } from 'next/server';

import { verifyAuth, type AuthUser } from '@/lib/server/auth';
import { getPaymentConfig } from '@/lib/server/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 未ログインでも呼べる。ログイン済みなら admin 判定に使う
async function getOptionalUser(request: Request): Promise<AuthUser | null> {
  try {
    // return だけだと失敗（Promise の reject）を下の catch で拾えないため、await してから返す
    return await verifyAuth(request);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  return NextResponse.json(getPaymentConfig(await getOptionalUser(request)));
}

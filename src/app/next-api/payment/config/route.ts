import { NextResponse } from 'next/server';

import { verifyAuth, type AuthUser } from '@/lib/server/auth';
import { getPaymentConfig } from '@/lib/server/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 未ログインでも呼べる。ログイン済みなら admin 判定に使う
function getOptionalUser(request: Request): AuthUser | null {
  try {
    return verifyAuth(request);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  return NextResponse.json(getPaymentConfig(getOptionalUser(request)));
}

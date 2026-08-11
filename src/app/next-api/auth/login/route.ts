import { NextResponse } from 'next/server';

import { AuthAccountError, login } from '@/lib/server/authAccount';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const result = await login(await request.json());

    return NextResponse.json(result.body, {
      headers: result.source !== 'db' ? { 'x-next-api-fallback': result.source } : undefined,
    });
  } catch (error) {
    if (error instanceof AuthAccountError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Failed to login.', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

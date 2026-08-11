import { NextResponse } from 'next/server';

import { AuthError, verifyAuth } from '@/lib/server/auth';
import { AuthAccountError, getMe, updateMe } from '@/lib/server/authAccount';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authUser = verifyAuth(request);
    const result = await getMe(authUser.userId);

    return NextResponse.json(result.body);
  } catch (error) {
    if (error instanceof AuthError || error instanceof AuthAccountError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Failed to fetch current user.', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authUser = verifyAuth(request);
    const result = await updateMe(authUser.userId, await request.json());

    return NextResponse.json(result.body);
  } catch (error) {
    if (error instanceof AuthError || error instanceof AuthAccountError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Failed to update current user.', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

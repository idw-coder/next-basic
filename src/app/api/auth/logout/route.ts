import { NextResponse } from 'next/server';

import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  deleteSession,
  getSessionToken,
} from '@/lib/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET にしないのは、他サイトに <img src=".../api/auth/logout"> を置かれるだけでログアウトさせられるため。
// POST なら SameSite=Lax の cookie は他サイトから送られない。
// Google 側のログアウトはしない（このアプリの session を消すだけ。Google のトークンは保存していない）
export async function POST(request: Request) {
  try {
    const sessionToken = getSessionToken(request);
    if (sessionToken) {
      await deleteSession(sessionToken);
    }
  } catch (error) {
    // DB の行が消せなくても cookie は消し、この端末ではログアウトさせる。残った行は expiresAt で期限切れになる
    console.error('Failed to delete session.', error);
  }

  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set(SESSION_COOKIE_NAME, '', { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });

  return response;
}

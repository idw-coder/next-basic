import { NextResponse } from 'next/server';

import {
  GoogleAuthError,
  getGoogleFailureRedirect,
  handleGoogleCallback,
} from '@/lib/server/authAccount';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(';')) {
    const [key, ...valueParts] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(valueParts.join('='));
    }
  }

  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expectedState = getCookie(request, 'google_oauth_state');

  try {
    if (!code || !state || !expectedState || state !== expectedState) {
      throw new GoogleAuthError();
    }

    const redirectUrl = await handleGoogleCallback(request, code);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set('google_oauth_state', '', {
      maxAge: 0,
      path: '/next-api/auth/google',
    });

    return response;
  } catch (error) {
    if (!(error instanceof GoogleAuthError)) {
      console.error('Failed to complete Google login.', error);
    }

    const response = NextResponse.redirect(getGoogleFailureRedirect(request));
    response.cookies.set('google_oauth_state', '', {
      maxAge: 0,
      path: '/next-api/auth/google',
    });

    return response;
  }
}

import { NextResponse } from 'next/server';

import {
  MICROSOFT_OAUTH_COOKIE_NAME,
  MicrosoftAuthError,
  getMicrosoftFailureRedirect,
  handleMicrosoftCallback,
} from '@/lib/server/authAccount';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/server/session';

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

  try {
    const { redirectUrl, sessionToken } = await handleMicrosoftCallback(request, {
      code: url.searchParams.get('code'),
      state: url.searchParams.get('state'),
      oauthCookieValue: getCookie(request, MICROSOFT_OAUTH_COOKIE_NAME),
    });
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS);

    response.cookies.set(MICROSOFT_OAUTH_COOKIE_NAME, '', {
      maxAge: 0,
      path: '/api/auth/microsoft',
    });

    return response;
  } catch (error) {
    if (!(error instanceof MicrosoftAuthError)) {
      console.error('Failed to complete Microsoft login.', error);
    }

    const reason = error instanceof MicrosoftAuthError ? error.reason : 'failed';
    const response = NextResponse.redirect(getMicrosoftFailureRedirect(request, reason));
    response.cookies.set(MICROSOFT_OAUTH_COOKIE_NAME, '', {
      maxAge: 0,
      path: '/api/auth/microsoft',
    });

    return response;
  }
}

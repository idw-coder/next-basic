import { NextResponse } from 'next/server';

import {
  MICROSOFT_OAUTH_COOKIE_NAME,
  MicrosoftAuthError,
  createMicrosoftAuthorization,
  getMicrosoftFailureRedirect,
} from '@/lib/server/authAccount';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authorization = await createMicrosoftAuthorization(request);
    const response = NextResponse.redirect(authorization.url);

    response.cookies.set(MICROSOFT_OAUTH_COOKIE_NAME, authorization.oauthCookieValue, {
      httpOnly: true,
      maxAge: 10 * 60,
      path: '/api/auth/microsoft',
      sameSite: 'lax',
      secure: new URL(request.url).protocol === 'https:',
    });

    return response;
  } catch (error) {
    if (!(error instanceof MicrosoftAuthError)) {
      console.error('Failed to start Microsoft login.', error);
    }

    return NextResponse.redirect(getMicrosoftFailureRedirect(request));
  }
}

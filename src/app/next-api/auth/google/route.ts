import { NextResponse } from 'next/server';

import {
  GoogleAuthError,
  createGoogleAuthorization,
  getGoogleFailureRedirect,
} from '@/lib/server/authAccount';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authorization = createGoogleAuthorization(request);
    const response = NextResponse.redirect(authorization.url);

    response.cookies.set('google_oauth_state', authorization.state, {
      httpOnly: true,
      maxAge: 10 * 60,
      path: '/next-api/auth/google',
      sameSite: 'lax',
      secure: new URL(request.url).protocol === 'https:',
    });

    return response;
  } catch (error) {
    if (!(error instanceof GoogleAuthError)) {
      console.error('Failed to start Google login.', error);
    }

    return NextResponse.redirect(getGoogleFailureRedirect(request));
  }
}

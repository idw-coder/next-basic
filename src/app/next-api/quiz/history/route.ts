import { NextResponse } from 'next/server';

import { AuthError, verifyAuth } from '@/lib/server/auth';
import { getQuizHistory } from '@/lib/server/quizHistory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);
    const { answers, source } = await getQuizHistory(
      user.userId,
      request.headers.get('authorization'),
    );

    return NextResponse.json(answers, {
      headers: source !== 'db' ? { 'x-next-api-fallback': source } : undefined,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Failed to fetch quiz history.', error);
    return NextResponse.json([], { status: 200 });
  }
}

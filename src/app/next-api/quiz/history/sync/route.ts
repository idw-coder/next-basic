import { NextResponse } from 'next/server';

import { AuthError, verifyAuth } from '@/lib/server/auth';
import { syncQuizHistory } from '@/lib/server/quizHistory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    const result = await syncQuizHistory(
      user.userId,
      await request.json(),
      request.headers.get('authorization'),
    );

    return NextResponse.json(
      { synced: result.synced },
      {
        headers: result.source !== 'db' ? { 'x-next-api-fallback': result.source } : undefined,
      },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Failed to sync quiz history.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

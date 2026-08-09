import { NextResponse } from 'next/server';

import { AuthError, verifyAuth } from '@/lib/server/auth';
import {
  QuizHistoryParamsError,
  addQuizHistoryAnswer,
  getQuizHistory,
} from '@/lib/server/quizHistory';

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

export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    const result = await addQuizHistoryAnswer(
      user.userId,
      await request.json(),
      request.headers.get('authorization'),
    );

    return NextResponse.json(result.body, {
      status: result.status,
      headers: result.source !== 'db' ? { 'x-next-api-fallback': result.source } : undefined,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof QuizHistoryParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Failed to add quiz history.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

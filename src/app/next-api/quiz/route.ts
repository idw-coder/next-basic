import { NextResponse } from 'next/server';

import { AuthError, verifyAuth } from '@/lib/server/auth';
import {
  QuizCategoryNotFoundError,
  QuizDetailConflictError,
  QuizDetailParamsError,
  QuizTagNotFoundError,
  createQuiz,
} from '@/lib/server/quizDetail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    const result = await createQuiz(
      user.userId,
      await request.json(),
    );

    return NextResponse.json(result.body, {
      status: result.status,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof QuizDetailParamsError || error instanceof QuizTagNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizDetailConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof QuizCategoryNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to create quiz.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

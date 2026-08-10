import { NextResponse } from 'next/server';

import { AuthError, requireRole, verifyAuth } from '@/lib/server/auth';
import {
  QuizCategoryNotFoundError,
  QuizDetailConflictError,
  QuizDetailNotFoundError,
  QuizDetailParamsError,
  QuizTagNotFoundError,
  deleteQuiz,
  getQuizDetail,
  updateQuiz,
} from '@/lib/server/quizDetail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  const { quizId } = await params;

  try {
    const { quiz, source } = await getQuizDetail(quizId);

    if (!quiz) {
      return NextResponse.json(null, {
        headers: { 'x-next-api-fallback': source },
      });
    }

    return NextResponse.json(quiz, {
      headers: source !== 'db' ? { 'x-next-api-fallback': source } : undefined,
    });
  } catch (error) {
    if (error instanceof QuizDetailParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizDetailNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to fetch quiz detail.', error);
    return NextResponse.json(null, { status: 200 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  const { quizId } = await params;

  try {
    const user = verifyAuth(request);
    requireRole(user, 'editor');

    const result = await updateQuiz(
      quizId,
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

    if (error instanceof QuizDetailParamsError || error instanceof QuizTagNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizDetailConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof QuizDetailNotFoundError || error instanceof QuizCategoryNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to update quiz.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  const { quizId } = await params;

  try {
    const user = verifyAuth(request);
    requireRole(user, 'editor');

    const result = await deleteQuiz(quizId, request.headers.get('authorization'));

    return NextResponse.json(result.body, {
      status: result.status,
      headers: result.source !== 'db' ? { 'x-next-api-fallback': result.source } : undefined,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof QuizDetailParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizDetailNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to delete quiz.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

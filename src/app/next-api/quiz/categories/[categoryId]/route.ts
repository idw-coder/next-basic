import { NextResponse } from 'next/server';

import { AuthError, requireRole, verifyAuth } from '@/lib/server/auth';
import {
  QuizCategoryConflictError,
  QuizCategoryNotFoundError,
  QuizCategoryParamsError,
  deleteQuizCategory,
  updateQuizCategory,
} from '@/lib/server/quizCategories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;

  try {
    const user = verifyAuth(request);
    requireRole(user, 'editor');

    const result = await updateQuizCategory(
      categoryId,
      await request.json(),
      request.headers.get('authorization'),
    );

    return NextResponse.json(result.body, {
      headers: result.source !== 'db' ? { 'x-next-api-fallback': result.source } : undefined,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof QuizCategoryParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizCategoryConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof QuizCategoryNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to update category.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;

  try {
    const user = verifyAuth(request);
    requireRole(user, 'editor');

    const result = await deleteQuizCategory(categoryId, request.headers.get('authorization'));

    return NextResponse.json(result.body, {
      headers: result.source !== 'db' ? { 'x-next-api-fallback': result.source } : undefined,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof QuizCategoryParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizCategoryNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to delete category.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

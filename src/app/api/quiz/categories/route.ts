import { NextResponse } from 'next/server';

import { AuthError, requireRole, verifyAuth } from '@/lib/server/auth';
import {
  QuizCategoryConflictError,
  QuizCategoryParamsError,
  createQuizCategory,
  getQuizCategories,
} from '@/lib/server/quizCategories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { categories } = await getQuizCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories.', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    requireRole(user, 'editor');

    const result = await createQuizCategory(
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

    if (error instanceof QuizCategoryParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizCategoryConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error('Failed to create category.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

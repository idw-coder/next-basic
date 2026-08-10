import { NextResponse } from 'next/server';

import { AuthError, requireRole, verifyAuth } from '@/lib/server/auth';
import {
  QuizTagConflictError,
  QuizTagParamsError,
  createQuizTag,
  getQuizTags,
} from '@/lib/server/quizTags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { tags, source } = await getQuizTags();
    return NextResponse.json(tags, {
      headers: source !== 'db' ? { 'x-next-api-fallback': source } : undefined,
    });
  } catch (error) {
    console.error('Failed to fetch tags.', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    requireRole(user, 'editor');

    const result = await createQuizTag(
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

    if (error instanceof QuizTagParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizTagConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error('Failed to create tag.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

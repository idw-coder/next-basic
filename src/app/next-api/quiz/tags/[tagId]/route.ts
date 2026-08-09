import { NextResponse } from 'next/server';

import { AuthError, requireRole, verifyAuth } from '@/lib/server/auth';
import {
  QuizTagDetailNotFoundError,
  QuizTagDetailParamsError,
  getQuizTagDetail,
} from '@/lib/server/quizTagDetail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tagId: string }> },
) {
  const { tagId } = await params;

  try {
    const user = verifyAuth(request);
    requireRole(user, 'editor');

    const { tag, source } = await getQuizTagDetail(
      tagId,
      request.headers.get('authorization'),
    );

    if (!tag) {
      return NextResponse.json(null, {
        headers: { 'x-next-api-fallback': source },
      });
    }

    return NextResponse.json(tag, {
      headers: source !== 'db' ? { 'x-next-api-fallback': source } : undefined,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof QuizTagDetailParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizTagDetailNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to fetch tag detail.', error);
    return NextResponse.json(null, { status: 200 });
  }
}

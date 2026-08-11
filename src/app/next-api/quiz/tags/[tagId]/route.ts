import { NextResponse } from 'next/server';

import { AuthError, requireRole, verifyAuth } from '@/lib/server/auth';
import {
  QuizTagDetailNotFoundError,
  QuizTagDetailParamsError,
  deleteQuizTag,
  getQuizTagDetail,
  updateQuizTag,
} from '@/lib/server/quizTagDetail';
import { QuizTagConflictError, QuizTagParamsError } from '@/lib/server/quizTags';

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

    const { tag } = await getQuizTagDetail(tagId);

    if (!tag) {
      return NextResponse.json(null);
    }

    return NextResponse.json(tag);
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tagId: string }> },
) {
  const { tagId } = await params;

  try {
    const user = verifyAuth(request);
    requireRole(user, 'editor');

    const result = await updateQuizTag(
      tagId,
      await request.json(),
    );

    return NextResponse.json(result.body);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof QuizTagDetailParamsError || error instanceof QuizTagParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizTagConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof QuizTagDetailNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to update tag.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tagId: string }> },
) {
  const { tagId } = await params;

  try {
    const user = verifyAuth(request);
    requireRole(user, 'editor');

    const result = await deleteQuizTag(tagId);

    return NextResponse.json(result.body);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof QuizTagDetailParamsError || error instanceof QuizTagParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizTagDetailNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to delete tag.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

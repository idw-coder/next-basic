import { NextResponse } from 'next/server';

import { AuthError, verifyAuth } from '@/lib/server/auth';
import { QuizCsvParamsError, importQuizCsv } from '@/lib/server/quizCsv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = verifyAuth(request);
    const body = (await request.json()) as { csv?: unknown };

    const result = await importQuizCsv(
      user.userId,
      typeof body.csv === 'string' ? body.csv : '',
    );

    return NextResponse.json(result.body);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof QuizCsvParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Failed to import quiz CSV.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

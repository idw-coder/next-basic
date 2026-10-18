import { NextResponse } from 'next/server';

import { AuthError, verifyAuth } from '@/lib/server/auth';
import { QuizCsvParamsError, exportQuizCsv } from '@/lib/server/quizCsv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    verifyAuth(request);

    const url = new URL(request.url);
    const result = await exportQuizCsv(url.searchParams.get('category_id'));

    return new NextResponse(result.csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof QuizCsvParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Failed to export quiz CSV.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

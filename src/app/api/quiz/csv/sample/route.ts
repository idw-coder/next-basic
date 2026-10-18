import { NextResponse } from 'next/server';

import { createSampleQuizCsv } from '@/lib/server/quizCsv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return new NextResponse(createSampleQuizCsv(), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="quiz_import_sample.csv"',
    },
  });
}

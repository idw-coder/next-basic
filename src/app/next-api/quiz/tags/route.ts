import { NextResponse } from 'next/server';

import { getQuizTags } from '@/lib/server/quizTags';

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

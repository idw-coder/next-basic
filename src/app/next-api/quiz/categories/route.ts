import { NextResponse } from 'next/server';

import { getQuizCategories } from '@/lib/server/quizCategories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { categories, source } = await getQuizCategories();
    return NextResponse.json(categories, {
      headers: source !== 'db' ? { 'x-next-api-fallback': source } : undefined,
    });
  } catch (error) {
    console.error('Failed to fetch categories.', error);
    return NextResponse.json([], { status: 200 });
  }
}

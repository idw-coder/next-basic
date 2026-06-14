'use server';

import { getChaptersByBook } from '@/lib/books';

export interface InBookSearchResult {
  chapterSlug: string;
  title: string;
  order: number;
  snippet: string;
}

export async function searchInBook(
  bookSlug: string,
  query: string,
): Promise<InBookSearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const chapters = getChaptersByBook(bookSlug);
  const results: InBookSearchResult[] = [];

  for (const chapter of chapters) {
    const titleMatch = chapter.title.toLowerCase().includes(q);
    const descMatch = chapter.description?.toLowerCase().includes(q);

    let bodyMatch = false;
    if (chapter.body) {
      bodyMatch = chapter.body.toLowerCase().includes(q);
    }

    if (titleMatch || descMatch || bodyMatch) {
      const snippet = titleMatch
        ? ''
        : descMatch
          ? chapter.description || ''
          : '本文に一致';
      results.push({
        chapterSlug: chapter.chapterSlug,
        title: chapter.title,
        order: chapter.order,
        snippet,
      });
    }
  }

  return results;
}

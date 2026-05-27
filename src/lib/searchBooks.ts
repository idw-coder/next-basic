import { getAllBooks, getChaptersByBook } from '@/lib/books';

export interface SearchBookHit {
  kind: 'book';
  bookSlug: string;
  bookTitle: string;
  description: string;
}

export interface SearchChapterHit {
  kind: 'chapter';
  bookSlug: string;
  chapterSlug: string;
  bookTitle: string;
  title: string;
  description?: string;
}

export type SearchBookResult = SearchBookHit | SearchChapterHit;

function matches(text: string | undefined, query: string): boolean {
  if (!text) return false;
  return text.toLowerCase().includes(query);
}

/** 書籍・章の title / description をキーワードで検索する */
export function searchBooks(query: string): SearchBookResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchBookResult[] = [];

  for (const book of getAllBooks()) {
    if (matches(book.title, q) || matches(book.description, q)) {
      results.push({
        kind: 'book',
        bookSlug: book.bookSlug,
        bookTitle: book.title,
        description: book.description,
      });
    }

    for (const chapter of getChaptersByBook(book.bookSlug)) {
      if (matches(chapter.title, q) || matches(chapter.description, q)) {
        results.push({
          kind: 'chapter',
          bookSlug: book.bookSlug,
          chapterSlug: chapter.chapterSlug,
          bookTitle: book.title,
          title: chapter.title,
          description: chapter.description,
        });
      }
    }
  }

  return results;
}

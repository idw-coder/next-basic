import type { Book, Chapter } from '#site/content';
import booksData from '../../.velite/books.json';
import chaptersData from '../../.velite/chapters.json';

const books = booksData as Book[];
const chapters = chaptersData as Chapter[];

/**
 * クイズカテゴリページで関連する教科書バナーを表示するために使用
 * 新しい本を追加した際はここにエントリを追加すること
 */
const categoryToBookMap: Record<string, string> = {
  nextjs: 'next-js',
  'react-basic': 'react-learning',
  'javascript-basic': 'javascript',
  'nodejs-basic': 'node-js',
  'ts-general': 'typescript',
  'unit-testing': 'unit-testing',
  'git-basic': 'git-basic',
  'cs-basic': 'cs-basics',
  'css-basic': 'css-basics',
  'tailwind-css': 'tailwind-css',
  'aws-basic': 'aws-saa-c03',
  'sql-basic': 'sql-basics',
};

/** 書籍一覧の表示順（先頭が先に表示される） */
export const BOOK_ORDER = [
  'aws-saa-c03',
  'azure-az-900',
  'http-and-web-api',
  'sql-basics',
  'integration-and-e2e-testing',
  'system-design',
  'javascript',
  'node-js',
  'typescript',
  'react-learning',
  'css-basics',
  'tailwind-css',
  'unit-testing',
  'git-basic',
  'github-actions',
  'cs-basics',
  'next-js',
] as const;

/** NEW バッジを付ける書籍 */
export const NEW_BOOK_SLUGS = new Set<string>([
  'github-actions',
  'azure-az-900',
  'node-js',
  'sql-basics',
  'aws-saa-c03',
  'system-design',
  'http-and-web-api',
  'integration-and-e2e-testing',
]);

function sortBooks<T extends { bookSlug: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ai = BOOK_ORDER.indexOf(a.bookSlug as (typeof BOOK_ORDER)[number]);
    const bi = BOOK_ORDER.indexOf(b.bookSlug as (typeof BOOK_ORDER)[number]);
    return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
  });
}

/**
 * クイズカテゴリに紐づく書籍を返す。
 * マッピングが存在しない場合は null を返す。
 * 使用箇所: src/app/quiz/[category]/page.tsx（関連教科書バナー）
 */
export function getBookForCategory(categorySlug: string) {
  const bookSlug = categoryToBookMap[categorySlug];
  if (!bookSlug) return null;
  return getBook(bookSlug) ?? null;
}

/** Velite が生成した全書籍データを表示順で返す。使用箇所: /books 一覧ページ・トップページ */
export function getAllBooks() {
  return sortBooks(books);
}

/** bookSlug に一致する書籍を1件返す。見つからなければ undefined */
export function getBook(bookSlug: string) {
  return books.find((b) => b.bookSlug === bookSlug);
}

/**
 * 指定した書籍に属する全章を order 昇順で返す。
 * サイドバーの章リストや目次の生成に使用する。
 */
export function getChaptersByBook(bookSlug: string) {
  return chapters.filter((c) => c.bookSlug === bookSlug).sort((a, b) => a.order - b.order);
}

/** bookSlug + chapterSlug に一致する章を1件返す。見つからなければ undefined */
export function getChapter(bookSlug: string, chapterSlug: string) {
  return chapters.find((c) => c.bookSlug === bookSlug && c.chapterSlug === chapterSlug);
}

/**
 * 現在の章の前後にある章を返す。
 * 先頭の場合は prev が null、末尾の場合は next が null になる。
 * 使用箇所: 章ページ下部の「前の章へ / 次の章へ」ナビゲーション
 */
export function getAdjacentChapters(bookSlug: string, chapterSlug: string) {
  const bookChapters = getChaptersByBook(bookSlug);
  const currentIndex = bookChapters.findIndex((c) => c.chapterSlug === chapterSlug);

  return {
    prev: currentIndex > 0 ? bookChapters[currentIndex - 1] : null,
    next: currentIndex < bookChapters.length - 1 ? bookChapters[currentIndex + 1] : null,
  };
}

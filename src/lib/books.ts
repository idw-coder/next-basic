import { books, chapters } from '#site/content';

/**
 * クイズカテゴリページで関連する教科書バナーを表示するために使用
 * 新しい本を追加した際はここにエントリを追加すること
 */
const categoryToBookMap: Record<string, string> = {
  nextjs: 'nextjs',
  'react-basic': 'react-learning',
  'unit-testing': 'unit-testing',
  'git-basic': 'git',
  'cs-basic': 'cs-basics',
};

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

/** Velite が生成した全書籍データを返す。使用箇所: /books 一覧ページ */
export function getAllBooks() {
  return books;
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

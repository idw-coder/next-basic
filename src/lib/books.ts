import { books, chapters } from "#site/content";

const categoryToBookMap: Record<string, string> = {
  nextjs: "nextjs",
  "react-basic": "nextjs",
};

export function getBookForCategory(categorySlug: string) {
  const bookSlug = categoryToBookMap[categorySlug];
  if (!bookSlug) return null;
  return getBook(bookSlug) ?? null;
}

export function getAllBooks() {
  return books;
}

export function getBook(bookSlug: string) {
  return books.find((b) => b.bookSlug === bookSlug);
}

export function getChaptersByBook(bookSlug: string) {
  return chapters
    .filter((c) => c.bookSlug === bookSlug)
    .sort((a, b) => a.order - b.order);
}

export function getChapter(bookSlug: string, chapterSlug: string) {
  return chapters.find(
    (c) => c.bookSlug === bookSlug && c.chapterSlug === chapterSlug
  );
}

export function getAdjacentChapters(bookSlug: string, chapterSlug: string) {
  const bookChapters = getChaptersByBook(bookSlug);
  const currentIndex = bookChapters.findIndex(
    (c) => c.chapterSlug === chapterSlug
  );

  return {
    prev: currentIndex > 0 ? bookChapters[currentIndex - 1] : null,
    next:
      currentIndex < bookChapters.length - 1
        ? bookChapters[currentIndex + 1]
        : null,
  };
}

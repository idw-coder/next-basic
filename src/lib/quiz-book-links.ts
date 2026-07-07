import { getBook, getChapter } from '@/lib/books';

/**
 * クイズ解説文から教科書章へのリンクを抽出し、カード表示用のデータに解決する。
 * Server Component専用（Veliteの章データを参照するため、クライアントでimportしない）。
 */
export interface RelatedChapterLink {
  /** カードのリンク先（相対URL、アンカー含む） */
  href: string;
  bookSlug: string;
  bookTitle: string;
  chapterTitle: string;
  readingTime: number;
  /** アンカーがある場合、デコード済みのセクション名 */
  anchorText?: string;
  /** 解説本文から取り除く、元のURL文字列（絶対URL等そのままの形） */
  matched: string[];
}

const BOOK_URL_RE =
  /(?:https?:\/\/[^\s"'()<>\]]*?)?\/books\/([a-z0-9][a-z0-9-]*)\/([a-z0-9][a-z0-9-]*)(#[^\s"'()<>\]]*)?/g;

function decodeAnchor(anchor: string): string | undefined {
  try {
    const text = decodeURIComponent(anchor.replace(/^#/, ''));
    // rehype-slug のid（スペースが - に変換されている）を読みやすく戻す
    return text.replace(/-/g, ' ').replace(/\s+/g, ' ').trim() || undefined;
  } catch {
    return undefined;
  }
}

export function extractBookChapterLinks(explanation: string): RelatedChapterLink[] {
  const found = new Map<string, RelatedChapterLink>();

  for (const m of explanation.matchAll(BOOK_URL_RE)) {
    const [matched, bookSlug, chapterSlug, anchor] = m;
    const chapter = getChapter(bookSlug, chapterSlug);
    const book = getBook(bookSlug);
    // 存在しない章・執筆中の章はカード化しない（元のリンクをそのまま残す）
    if (!chapter || !book || chapter.draft) continue;

    const key = `${bookSlug}/${chapterSlug}${anchor ?? ''}`;
    const existing = found.get(key);
    if (existing) {
      if (!existing.matched.includes(matched)) existing.matched.push(matched);
      continue;
    }
    found.set(key, {
      href: `/books/${bookSlug}/${chapterSlug}${anchor ?? ''}`,
      bookSlug,
      bookTitle: book.title,
      chapterTitle: chapter.title,
      readingTime: chapter.readingTime,
      anchorText: anchor ? decodeAnchor(anchor) : undefined,
      matched: [matched],
    });
  }

  return [...found.values()];
}

import { getBook, getChapter } from './books';

/**
 * クイズ詳細ページへの流入元。
 *
 * 教科書のように「戻る先が問題の集合ではない」入口を表す。
 * sessionStorage ではなく URL（?from=）で受け渡すため、
 * 共有・ブラウザバック・TTL 切れのいずれでも壊れない。
 */
export interface QuizOrigin {
  /** 戻り先のパス。既知の章からのみ組み立てるため外部URLは入り得ない */
  href: string;
  /** 解答後ブロックの見出し */
  title: string;
  /** 主導線ボタンの文言 */
  actionLabel: string;
  /** 受け取った ?from= の値。次の問題へ遷移する際も引き継ぐために保持する */
  param: string;
}

const BOOK_PREFIX = 'book:';

/**
 * `?from=book:<bookSlug>/<chapterSlug>` を戻り先に変換する。
 *
 * 値はそのまま href にせず bookSlug / chapterSlug に分解して
 * 実在する章に一致した場合だけパスを組み立てる。
 * 任意のURLを流し込まれてもリンク先にならない。
 */
export function resolveQuizOrigin(from: string | undefined): QuizOrigin | null {
  if (!from || !from.startsWith(BOOK_PREFIX)) return null;

  const [bookSlug, chapterSlug] = from.slice(BOOK_PREFIX.length).split('/');
  if (!bookSlug || !chapterSlug) return null;

  const book = getBook(bookSlug);
  const chapter = getChapter(bookSlug, chapterSlug);
  if (!book || !chapter) return null;

  return {
    href: `/books/${bookSlug}/${chapterSlug}`,
    title: `「${chapter.title}」の続きを読む`,
    actionLabel: '教科書に戻る',
    param: from,
  };
}

/** 章ページから渡す ?from= の値を組み立てる */
export function buildChapterOriginParam(bookSlug: string, chapterSlug: string): string {
  return `${BOOK_PREFIX}${bookSlug}/${chapterSlug}`;
}

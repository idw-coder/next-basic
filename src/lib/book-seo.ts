/**
 * 教科書（books）の検索結果向けタイトル生成。
 *
 * 章のfrontmatter title は「主題 — 補足」の形式で、本のタイトルも同じ形式のものが多い。
 * これらをそのまま連結して `章タイトル - 本タイトル | サイト名` にすると全角70〜100文字になり、
 * 日本語の検索結果（全角28〜32文字前後で省略）ではほぼ全部が切れてサイト名まで届かない。
 * 切れたタイトルはGoogleに書き換えられやすく、こちらで文言を制御できなくなる。
 *
 * そこで「— 以降の補足」と冗長なサイト名を metadata からは落とし、
 * 先頭に検索意図のキーワードが来るようにする。本文中のH1や目次の表示は変えない。
 */

import { SITE_URL } from '@/lib/site';

/** 検索結果で省略されにくい全角文字数の目安 */
export const SERP_TITLE_BUDGET = 32;

/**
 * 「— 補足」を落として主題だけを返す。
 * 区切りは前後に半角スペースを伴う em ダッシュのみ（`SAA-C03` や `text-lg` を壊さないため）。
 */
export function stripSubtitle(title: string): string {
  const main = title.split(' — ')[0].trim();
  // 「— 補足」しか無いタイトルが将来書かれても空文字にはしない
  return main || title.trim();
}

/**
 * 本の短縮名。ダッシュで切っても長い・切る場所がない本だけ明示的に指定する。
 * ここに無い本は `stripSubtitle` の結果を使う。
 */
const BOOK_SHORT_TITLE: Record<string, string> = {
  'aws-saa-c03': 'AWS SAA-C03',
  'azure-az-900': 'AZ-900',
  'github-actions': 'GitHub Actions',
  'coding-test': 'コーディングテスト',
  'integration-and-e2e-testing': '結合テスト・E2E',
  'unit-testing': 'ユニットテスト',
  'cs-basics': 'CS基礎',
  'system-design': 'システム設計',
  'git-basic': 'Git',
  'sql-basics': 'SQL基礎',
  'tailwind-css': 'Tailwind CSS',
};

export function getBookShortTitle(bookSlug: string, bookTitle: string): string {
  return BOOK_SHORT_TITLE[bookSlug] ?? stripSubtitle(bookTitle);
}

/**
 * 章ページの <title>。`主題｜本の短縮名` を基本形とする。
 * 主題に本の短縮名がそのまま含まれる場合（例:「Gitの初期設定」×「Git」）は繰り返さない。
 */
export function buildChapterTitle(
  chapterTitle: string,
  bookSlug: string,
  bookTitle: string,
): string {
  const main = stripSubtitle(chapterTitle);
  const short = getBookShortTitle(bookSlug, bookTitle);
  if (main.toLowerCase().includes(short.toLowerCase())) return main;
  return `${main}｜${short}`;
}

/**
 * 章・本に共通で使うOG画像。
 * 本ごとの coverImage は512px角のロゴでOGカードにもArticleの image にも小さすぎるため使わない。
 */
export const BOOKS_OG_IMAGE = `${SITE_URL}/images/books-hero-editorial-human-v2.png`;
/** 実ファイルの寸法。og:image:width/height は実寸と食い違わせない */
export const BOOKS_OG_IMAGE_WIDTH = 1720;
export const BOOKS_OG_IMAGE_HEIGHT = 914;
export const BOOKS_OG_IMAGE_ALT =
  '鮮やかな色面の中で青い本を読む人物を描いた、ウェブエンジニア問題集の教科書キービジュアル';

/** 構造化データの author / publisher で共通に使う発行者情報 */
export const SITE_PUBLISHER = {
  '@type': 'Organization',
  name: 'ウェブエンジニア問題集',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/images/site-mark.svg`,
  },
} as const;

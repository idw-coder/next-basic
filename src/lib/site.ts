/**
 * サイトの公開URL。
 * canonical / openGraph / sitemap / robots / JSON-LD はすべてここを参照する。
 * フォールバックのドメインを個別ファイルに直書きしないこと（食い違い事故防止）。
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://study.ntorelabo.com';

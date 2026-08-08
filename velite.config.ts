/**
 * Velite コンテンツ管理設定
 *
 * content/ 配下の YAML / MDX を処理し、型付きデータを .velite/ に出力する
 *
 * Next.js との統合は next.config.ts の VeliteWebpackPlugin
 *
 * @see https://velite.js.org
 */
import { execSync } from 'node:child_process';
import { statSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, defineCollection, s } from 'velite';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import GithubSlugger from 'github-slugger';

const CHARS_PER_MINUTE = 500;

function stripCodeBlocks(raw: string) {
  return raw
    .replace(/(^|\n)(```+|~~~+)[^\n]*\n[\s\S]*?\n\2[ \t]*(?=\n|$)/g, '\n')
    .replace(/(^|\n)(?: {4}|\t).*(?=\n|$)/g, '\n');
}

function calculateReadingTime(raw: string) {
  const charCount = Array.from(stripCodeBlocks(raw).replace(/\s/g, '')).length;
  return Math.max(1, Math.ceil(charCount / CHARS_PER_MINUTE));
}

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

// 見出しのMarkdown/JSX装飾を除去し、レンダリング後のテキストに近づける
// （rehype-slug は描画後のテキストから id を生成するため、slug 計算の入力を揃える）
function headingToText(heading: string) {
  return heading
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * raw から h2/h3 見出しを抽出して目次データを作る。
 * id は rehype-slug と同じ github-slugger で生成するため、本文の見出し id と一致する。
 * 重複見出しの連番（-1 サフィックス）を揃えるため、h2/h3 以外の見出しでも slug は消費する。
 */
function extractToc(raw: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const toc: TocEntry[] = [];
  const headingRe = /^(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*$/gm;
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(stripCodeBlocks(raw))) !== null) {
    const level = match[1].length;
    const text = headingToText(match[2]);
    if (!text) continue;
    const id = slugger.slug(text);
    // 手書きの「## 目次」セクション自体は目次に載せない
    if ((level === 2 || level === 3) && text !== '目次') {
      toc.push({ id, text, level });
    }
  }
  return toc;
}

/**
 * ファイルの最終更新日時（ISO文字列）を返す。sitemapのlastModifiedに使用。
 * 1. gitの最終コミット日時（正確・ローカル/履歴ありCI向け）
 * 2. shallow cloneや未コミットファイルで取れない場合はファイルmtimeにフォールバック
 */
function getUpdatedAt(relPath: string): string {
  const filePath = path.join('content', relPath);
  try {
    const out = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (out) return out;
  } catch {
    // gitが使えない環境（shallow clone等）はmtimeへ
  }
  try {
    return statSync(filePath).mtime.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * booksコレクション
 *
 * 対象 content/books/{bookSlug}/index.yaml
 */
const books = defineCollection({
  name: 'Book',
  pattern: 'books/*/index.yaml',
  schema: s
    .object({
      title: s.string(),
      description: s.string(),
      coverImage: s.string().optional(),
      slug: s.path(), // ファイルパスから "books/nextjs/index" のような文字列を生成
    })
    .transform((data) => ({
      ...data,
      // "books/nextjs/index" → "nextjs"
      bookSlug: data.slug.split('/')[1],
    })),
});

/**
 * chaptersコレクション
 *
 * 対象 content/books/{bookSlug}/*.mdx（index.yaml は pattern に一致しないため除外される）
 * s.mdx() は MDX を JavaScript の関数本体文字列にコンパイルする。
 * レンダリングは src/components/mdx-content.tsx の MDXContent で行う。
 */
const chapters = defineCollection({
  name: 'Chapter',
  pattern: 'books/*/*.mdx',
  schema: s
    .object({
      title: s.string(),
      description: s.string().optional(),
      order: s.number(), // 章の表示順（昇順ソートに使用）
      chapterLabel: s.string().optional(), // 小数 order などを読者向けに自然に表示する任意ラベル
      draft: s.boolean().default(false), // 執筆中の章。noindex・sitemap除外・バッジ表示の対象
      slug: s.path(),
      raw: s.raw(),
      body: s.mdx(), // コンパイル済み MDX コード
    })
    .transform((data) => {
      // "books/nextjs/01-introduction" → bookSlug: "nextjs", chapterSlug: "01-introduction"
      const parts = data.slug.split('/');
      const { raw, ...chapter } = data;
      return {
        ...chapter,
        bookSlug: parts[1],
        chapterSlug: parts[2],
        readingTime: calculateReadingTime(raw),
        toc: extractToc(raw),
        updated: getUpdatedAt(`${data.slug}.mdx`),
      };
    }),
});

/**
 * Velite 設定
 */
export default defineConfig({
  // コンテンツのルートディレクトリ（プロジェクトルートからの相対パス）
  root: 'content',
  output: {
    data: '.velite', // 型付きデータの出力先（tsconfig.json の #site/content エイリアスで参照）
    assets: 'public/static', // 画像等アセットのコピー先
    base: '/static/',
    name: '[name]-[hash:6].[ext]', // アセットのファイル名テンプレート
    clean: true, // ビルド前に出力先をクリーン
  },
  collections: { books, chapters },
  mdx: {
    // MDX コンパイル時に適用する rehype プラグイン（HTML AST 変換）
    rehypePlugins: [
      rehypeSlug, // 見出し要素に id 属性を自動付与
      [rehypePrettyCode, { theme: 'github-dark' }], // shiki ベースのコードハイライト
      [
        rehypeAutolinkHeadings, // 見出しテキストをアンカーリンクでラップ
        {
          behavior: 'wrap',
          properties: {
            className: ['subheading-anchor'],
            ariaLabel: 'Link to section',
          },
        },
      ],
    ],
    remarkPlugins: [], // Markdown AST 変換プラグイン（現在未使用）
  },
});

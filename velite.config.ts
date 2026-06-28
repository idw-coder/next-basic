/**
 * Velite コンテンツ管理設定
 *
 * content/ 配下の YAML / MDX を処理し、型付きデータを .velite/ に出力する
 *
 * Next.js との統合は next.config.ts の VeliteWebpackPlugin
 *
 * @see https://velite.js.org
 */
import { defineConfig, defineCollection, s } from 'velite';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

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
      slug: s.path(),
      body: s.mdx(), // コンパイル済み MDX コード
    })
    .transform((data) => {
      // "books/nextjs/01-introduction" → bookSlug: "nextjs", chapterSlug: "01-introduction"
      const parts = data.slug.split('/');
      return {
        ...data,
        bookSlug: parts[1],
        chapterSlug: parts[2],
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

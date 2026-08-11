import { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { getAllBooks, getChaptersByBook } from "@/lib/books";
import { getQuizCategoryQuizzes } from "@/lib/server/quizCategoryQuizzes";
import { getQuizCategories } from "@/lib/server/quizCategories";

import { SITE_URL } from '@/lib/site';

// DBへ直接アクセスするため、ビルド時プリレンダの対象から外す。
// 静的化されるとビルド環境（DB到達不可）の結果が固定され、クイズURLが永久に欠落する。
export const dynamic = 'force-dynamic';

interface Category {
  id: number;
  slug: string;
  category_name: string;
}

interface Quiz {
  id: number;
  slug: string;
  question: string;
}

interface CategoryWithQuizzes {
  category: Category;
  quizzes: Quiz[];
}

// 例外はキャッシュさせたくないので、try/catchはキャッシュの外側に置く。
// 途中で失敗した場合に部分的なsitemapを配信しないよう、全カテゴリ分をまとめて取得する。
const fetchQuizzesByCategory = unstable_cache(
  async (): Promise<CategoryWithQuizzes[]> => {
    const { categories } = await getQuizCategories();

    return Promise.all(
      categories.map(async (category) => ({
        category,
        quizzes: (await getQuizCategoryQuizzes(category.id)).quizzes,
      }))
    );
  },
  ['sitemap-quizzes-by-category'],
  { revalidate: 3600 },
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let quizzesByCategory: CategoryWithQuizzes[] = [];
  try {
    quizzesByCategory = await fetchQuizzesByCategory();
  } catch (error) {
    console.error('Failed to fetch quizzes for sitemap:', error);
  }

  const categories = quizzesByCategory.map(({ category }) => category);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/about/tech`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/quiz/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const quizPages: MetadataRoute.Sitemap = quizzesByCategory.flatMap(
    ({ category, quizzes }) =>
      quizzes.map((quiz) => ({
        url: `${SITE_URL}/quiz/${category.slug}/${quiz.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
  );

  const allBooks = getAllBooks();

  // 章の更新日時はVeliteビルド時に算出した実更新日時（git log / mtime）を使う。
  // 本ページは公開章の更新日時の最大値。
  const publicChaptersByBook = new Map(
    allBooks.map((book) => [
      book.bookSlug,
      getChaptersByBook(book.bookSlug).filter((chapter) => !chapter.draft),
    ])
  );
  const latestUpdated = (bookSlug: string): Date => {
    const timestamps = (publicChaptersByBook.get(bookSlug) ?? []).map((c) =>
      new Date(c.updated).getTime()
    );
    return timestamps.length > 0 ? new Date(Math.max(...timestamps)) : new Date();
  };

  const bookPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/books`,
      lastModified: new Date(
        Math.max(...allBooks.map((b) => latestUpdated(b.bookSlug).getTime()))
      ),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...allBooks.map((book) => ({
      url: `${SITE_URL}/books/${book.bookSlug}`,
      lastModified: latestUpdated(book.bookSlug),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...allBooks.flatMap((book) =>
      (publicChaptersByBook.get(book.bookSlug) ?? []).map((chapter) => ({
        url: `${SITE_URL}/books/${book.bookSlug}/${chapter.chapterSlug}`,
        lastModified: new Date(chapter.updated),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    ),
  ];

  return [...staticPages, ...bookPages, ...categoryPages, ...quizPages];
}

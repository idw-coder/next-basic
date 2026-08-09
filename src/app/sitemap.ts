import { MetadataRoute } from "next";
import { getAllBooks, getChaptersByBook } from "@/lib/books";
import { getQuizCategoryQuizzes } from "@/lib/server/quizCategoryQuizzes";
import { getQuizCategories } from "@/lib/server/quizCategories";

import { SITE_URL } from '@/lib/site';

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

async function getCategories(): Promise<Category[]> {
  try {
    const { categories } = await getQuizCategories();
    return categories;
  } catch {
    return [];
  }
}

async function getQuizzesByCategory(categoryId: number): Promise<Quiz[]> {
  try {
    const { quizzes } = await getQuizCategoryQuizzes(categoryId);
    return quizzes;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories();

  const quizzesByCategory = await Promise.all(
    categories.map(async (cat) => ({
      category: cat,
      quizzes: await getQuizzesByCategory(cat.id),
    }))
  );

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

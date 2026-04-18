import { MetadataRoute } from "next";
import { getAllBooks, getChaptersByBook } from "@/lib/books";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8888";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://study.ntorelabo.com";

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
    const res = await fetch(`${API_BASE_URL}/api/quiz/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function getQuizzesByCategory(categoryId: number): Promise<Quiz[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/quiz/category/${categoryId}/quizzes`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    return await res.json();
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
      url: `${SITE_URL}/quiz/search`,
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

  const bookPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/books`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...allBooks.map((book) => ({
      url: `${SITE_URL}/books/${book.bookSlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...allBooks.flatMap((book) =>
      getChaptersByBook(book.bookSlug).map((chapter) => ({
        url: `${SITE_URL}/books/${book.bookSlug}/${chapter.chapterSlug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    ),
  ];

  return [...staticPages, ...bookPages, ...categoryPages, ...quizPages];
}

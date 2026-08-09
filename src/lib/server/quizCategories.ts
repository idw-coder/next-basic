import type { RowDataPacket } from 'mysql2';

import { getMysqlPool } from '@/lib/server/mysql';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8888';

interface QuizCategoryRow extends RowDataPacket {
  id: number;
  slug: string;
  category_name: string;
  description: string | null;
  display_order: number | null;
  quiz_count: number | string;
}

export interface QuizCategory {
  id: number;
  slug: string;
  category_name: string;
  description: string | null;
  display_order: number | null;
  quiz_count: number;
}

export interface QuizCategoriesResult {
  categories: QuizCategory[];
  source: 'db' | 'express-fallback' | 'unavailable';
}

async function fetchCategoriesFromExpress(): Promise<QuizCategory[]> {
  const res = await fetch(`${API_BASE_URL}/api/quiz/categories`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Express categories fallback failed: ${res.status}`);
  }

  return (await res.json()) as QuizCategory[];
}

async function getCategoriesFromDb(): Promise<QuizCategory[]> {
  const [rows] = await getMysqlPool().query<QuizCategoryRow[]>(`
    SELECT
      c.id,
      c.slug,
      c.category_name,
      c.description,
      c.display_order,
      COUNT(q.id) AS quiz_count
    FROM quiz_category c
    LEFT JOIN quiz q ON q.category_id = c.id
    GROUP BY c.id, c.slug, c.category_name, c.description, c.display_order
    ORDER BY COALESCE(c.display_order, c.id), c.id
  `);

  return rows.map((row) => ({
    id: Number(row.id),
    slug: row.slug,
    category_name: row.category_name,
    description: row.description,
    display_order: row.display_order === null ? null : Number(row.display_order),
    quiz_count: Number(row.quiz_count),
  }));
}

export async function getQuizCategories(): Promise<QuizCategoriesResult> {
  try {
    return {
      categories: await getCategoriesFromDb(),
      source: 'db',
    };
  } catch (error) {
    console.error('Failed to fetch categories from DB. Falling back to Express.', error);

    try {
      return {
        categories: await fetchCategoriesFromExpress(),
        source: 'express-fallback',
      };
    } catch (fallbackError) {
      console.error('Failed to fetch categories from Express fallback.', fallbackError);

      return {
        categories: [],
        source: 'unavailable',
      };
    }
  }
}

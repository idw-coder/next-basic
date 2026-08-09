import type { RowDataPacket } from 'mysql2';

import { getMysqlPool } from '@/lib/server/mysql';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8888';

interface QuizCategoryTagRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string;
}

export interface QuizCategoryTag {
  id: number;
  slug: string;
  name: string;
}

export interface QuizCategoryTagsResult {
  tags: QuizCategoryTag[];
  source: 'db' | 'express-fallback' | 'unavailable';
}

export class QuizCategoryTagsParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizCategoryTagsParamsError';
  }
}

function parseCategoryId(categoryId: string | number): number {
  const parsed = Number(categoryId);
  if (!Number.isFinite(parsed)) {
    throw new QuizCategoryTagsParamsError('Invalid category id');
  }

  return parsed;
}

async function fetchTagsFromExpress(categoryId: number): Promise<QuizCategoryTag[]> {
  const res = await fetch(`${API_BASE_URL}/api/quiz/category/${categoryId}/tags`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Express category tags fallback failed: ${res.status}`);
  }

  return (await res.json()) as QuizCategoryTag[];
}

async function getTagsFromDb(categoryId: number): Promise<QuizCategoryTag[]> {
  const [rows] = await getMysqlPool().query<QuizCategoryTagRow[]>(
    `
      SELECT DISTINCT
        tag.id,
        tag.slug,
        tag.name
      FROM quiz_tag tag
      INNER JOIN quiz_tagging tagging ON tagging.quiz_tag_id = tag.id
      INNER JOIN quiz quiz ON quiz.id = tagging.quiz_id
      WHERE quiz.category_id = ?
        AND quiz.deleted_at IS NULL
      ORDER BY tag.slug ASC
    `,
    [categoryId],
  );

  return rows.map((row) => ({
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
  }));
}

export async function getQuizTagsByCategory(
  categoryIdInput: string | number,
): Promise<QuizCategoryTagsResult> {
  const categoryId = parseCategoryId(categoryIdInput);

  try {
    return {
      tags: await getTagsFromDb(categoryId),
      source: 'db',
    };
  } catch (error) {
    console.error('Failed to fetch category tags from DB. Falling back to Express.', error);

    try {
      return {
        tags: await fetchTagsFromExpress(categoryId),
        source: 'express-fallback',
      };
    } catch (fallbackError) {
      console.error('Failed to fetch category tags from Express fallback.', fallbackError);

      return {
        tags: [],
        source: 'unavailable',
      };
    }
  }
}

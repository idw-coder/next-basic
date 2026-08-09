import type { RowDataPacket } from 'mysql2';

import { getMysqlPool } from '@/lib/server/mysql';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8888';

interface QuizTagRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string;
  quiz_count: number | string;
}

export interface QuizTag {
  id: number;
  slug: string;
  name: string;
  quiz_count: number;
}

export interface QuizTagsResult {
  tags: QuizTag[];
  source: 'db' | 'express-fallback' | 'unavailable';
}

async function fetchTagsFromExpress(): Promise<QuizTag[]> {
  const res = await fetch(`${API_BASE_URL}/api/quiz/tags`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Express tags fallback failed: ${res.status}`);
  }

  return (await res.json()) as QuizTag[];
}

async function getTagsFromDb(): Promise<QuizTag[]> {
  const [rows] = await getMysqlPool().query<QuizTagRow[]>(`
    SELECT
      tag.id,
      tag.slug,
      tag.name,
      COUNT(quiz.id) AS quiz_count
    FROM quiz_tag tag
    LEFT JOIN quiz_tagging tagging ON tagging.quiz_tag_id = tag.id
    LEFT JOIN quiz quiz ON quiz.id = tagging.quiz_id AND quiz.deleted_at IS NULL
    GROUP BY tag.id, tag.slug, tag.name
    ORDER BY tag.slug ASC
  `);

  return rows.map((row) => ({
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    quiz_count: Number(row.quiz_count),
  }));
}

export async function getQuizTags(): Promise<QuizTagsResult> {
  try {
    return {
      tags: await getTagsFromDb(),
      source: 'db',
    };
  } catch (error) {
    console.error('Failed to fetch tags from DB. Falling back to Express.', error);

    try {
      return {
        tags: await fetchTagsFromExpress(),
        source: 'express-fallback',
      };
    } catch (fallbackError) {
      console.error('Failed to fetch tags from Express fallback.', fallbackError);

      return {
        tags: [],
        source: 'unavailable',
      };
    }
  }
}

import type { RowDataPacket } from 'mysql2';

import { getMysqlPool } from '@/lib/server/mysql';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8888';

interface QuizSearchRow extends RowDataPacket {
  id: number;
  slug: string;
  category_id: number;
  category_slug: string | null;
  category_name: string | null;
  question: string;
}

interface QuizTagRow extends RowDataPacket {
  quiz_id: number;
  id: number;
  slug: string;
  name: string;
}

export interface QuizSearchTag {
  id: number;
  slug: string;
  name: string;
}

export interface QuizSearchItem {
  id: number;
  slug: string;
  category_id: number;
  category_slug: string | null;
  category_name: string | null;
  question: string;
  tags: QuizSearchTag[];
}

export interface QuizSearchParams {
  q?: string;
  categoryId?: string;
  tagSlug?: string;
  ids?: string;
}

export interface QuizSearchResult {
  quizzes: QuizSearchItem[];
  source: 'db' | 'express-fallback' | 'unavailable';
}

export class QuizSearchParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizSearchParamsError';
  }
}

function parseIds(ids: string | undefined): number[] | null {
  if (!ids) return null;

  const idList = ids.split(',').map((value) => Number(value.trim()));
  if (idList.length === 0 || idList.some((value) => !Number.isFinite(value))) {
    throw new QuizSearchParamsError('Invalid ids');
  }

  return idList;
}

function parseCategoryId(categoryId: string | undefined): number | null {
  if (!categoryId) return null;

  const parsed = Number(categoryId);
  if (!Number.isFinite(parsed)) {
    throw new QuizSearchParamsError('Invalid categoryId');
  }

  return parsed;
}

function buildSearchParams(params: QuizSearchParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.tagSlug) searchParams.set('tagSlug', params.tagSlug);
  if (params.ids) searchParams.set('ids', params.ids);
  return searchParams;
}

async function fetchSearchFromExpress(params: QuizSearchParams): Promise<QuizSearchItem[]> {
  const searchParams = buildSearchParams(params);
  const res = await fetch(`${API_BASE_URL}/api/quiz/search?${searchParams.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Express search fallback failed: ${res.status}`);
  }

  return (await res.json()) as QuizSearchItem[];
}

async function getSearchFromDb(params: QuizSearchParams): Promise<QuizSearchItem[]> {
  const idList = parseIds(params.ids);
  const categoryId = parseCategoryId(params.categoryId);
  const joinValues: Array<number | string> = [];
  const conditionValues: Array<number | string> = [];
  const joins: string[] = [
    'LEFT JOIN quiz_category category ON category.id = quiz.category_id',
  ];
  const conditions: string[] = ['quiz.deleted_at IS NULL'];

  if (idList) {
    conditions.push(`quiz.id IN (${idList.map(() => '?').join(', ')})`);
    conditionValues.push(...idList);
  }

  if (categoryId !== null) {
    conditions.push('quiz.category_id = ?');
    conditionValues.push(categoryId);
  }

  if (params.tagSlug) {
    joins.push('INNER JOIN quiz_tagging filter_tagging ON filter_tagging.quiz_id = quiz.id');
    joins.push('INNER JOIN quiz_tag filter_tag ON filter_tag.id = filter_tagging.quiz_tag_id AND filter_tag.slug = ?');
    joinValues.push(params.tagSlug);
  }

  if (params.q) {
    conditions.push('(quiz.question LIKE ? OR quiz.explanation LIKE ?)');
    conditionValues.push(`%${params.q}%`, `%${params.q}%`);
  }

  const [rows] = await getMysqlPool().query<QuizSearchRow[]>(
    `
      SELECT
        quiz.id,
        quiz.slug,
        quiz.category_id,
        category.slug AS category_slug,
        category.category_name,
        quiz.question
      FROM quiz
      ${joins.join('\n')}
      WHERE ${conditions.join(' AND ')}
      ORDER BY quiz.id ASC
    `,
    [...joinValues, ...conditionValues],
  );

  const quizIds = rows.map((row) => Number(row.id));
  const tagsByQuizId = new Map<number, QuizSearchTag[]>();

  if (quizIds.length > 0) {
    const [tagRows] = await getMysqlPool().query<QuizTagRow[]>(
      `
        SELECT
          tagging.quiz_id,
          tag.id,
          tag.slug,
          tag.name
        FROM quiz_tagging tagging
        INNER JOIN quiz_tag tag ON tag.id = tagging.quiz_tag_id
        WHERE tagging.quiz_id IN (${quizIds.map(() => '?').join(', ')})
        ORDER BY tagging.quiz_id ASC, tag.slug ASC
      `,
      quizIds,
    );

    for (const tagRow of tagRows) {
      const quizId = Number(tagRow.quiz_id);
      const tags = tagsByQuizId.get(quizId) ?? [];
      tags.push({
        id: Number(tagRow.id),
        slug: tagRow.slug,
        name: tagRow.name,
      });
      tagsByQuizId.set(quizId, tags);
    }
  }

  return rows.map((row) => {
    const quizId = Number(row.id);
    return {
      id: quizId,
      slug: row.slug,
      category_id: Number(row.category_id),
      category_slug: row.category_slug,
      category_name: row.category_name,
      question: row.question,
      tags: tagsByQuizId.get(quizId) ?? [],
    };
  });
}

export async function searchQuizzes(params: QuizSearchParams): Promise<QuizSearchResult> {
  try {
    return {
      quizzes: await getSearchFromDb(params),
      source: 'db',
    };
  } catch (error) {
    if (error instanceof QuizSearchParamsError) {
      throw error;
    }

    console.error('Failed to search quizzes from DB. Falling back to Express.', error);

    try {
      return {
        quizzes: await fetchSearchFromExpress(params),
        source: 'express-fallback',
      };
    } catch (fallbackError) {
      console.error('Failed to search quizzes from Express fallback.', fallbackError);

      return {
        quizzes: [],
        source: 'unavailable',
      };
    }
  }
}

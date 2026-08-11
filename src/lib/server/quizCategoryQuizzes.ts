import type { RowDataPacket } from 'mysql2';

import { getMysqlPool } from '@/lib/server/mysql';

interface QuizCategoryExistsRow extends RowDataPacket {
  id: number;
}

interface QuizCategoryQuizRow extends RowDataPacket {
  id: number;
  slug: string;
  question: string;
  created_at: Date | string;
  updated_at: Date | string;
}

interface QuizTagRow extends RowDataPacket {
  quiz_id: number;
  id: number;
  slug: string;
  name: string;
}

export interface QuizCategoryQuizTag {
  id: number;
  slug: string;
  name: string;
}

export interface QuizCategoryQuiz {
  id: number;
  slug: string;
  question: string;
  createdAt: string;
  updatedAt: string;
  tags: QuizCategoryQuizTag[];
}

export interface QuizCategoryQuizzesParams {
  q?: string;
  tagSlug?: string;
}

export interface QuizCategoryQuizzesResult {
  quizzes: QuizCategoryQuiz[];
  source: 'db';
}

export class QuizCategoryQuizzesParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizCategoryQuizzesParamsError';
  }
}

export class QuizCategoryNotFoundError extends Error {
  constructor() {
    super('Category not found');
    this.name = 'QuizCategoryNotFoundError';
  }
}

function parseCategoryId(categoryId: string | number): number {
  const parsed = Number(categoryId);
  if (!Number.isFinite(parsed)) {
    throw new QuizCategoryQuizzesParamsError('Invalid category id');
  }

  return parsed;
}

function serializeTimestamp(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

async function assertCategoryExists(categoryId: number): Promise<void> {
  const [rows] = await getMysqlPool().query<QuizCategoryExistsRow[]>(
    `
      SELECT id
      FROM quiz_category
      WHERE id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [categoryId],
  );

  if (rows.length === 0) {
    throw new QuizCategoryNotFoundError();
  }
}

async function getQuizzesFromDb(
  categoryId: number,
  params: QuizCategoryQuizzesParams,
): Promise<QuizCategoryQuiz[]> {
  await assertCategoryExists(categoryId);

  const joinValues: Array<number | string> = [];
  const conditionValues: Array<number | string> = [categoryId];
  const joins: string[] = [];
  const conditions: string[] = [
    'quiz.category_id = ?',
    'quiz.deleted_at IS NULL',
  ];

  if (params.tagSlug) {
    joins.push('INNER JOIN quiz_tagging filter_tagging ON filter_tagging.quiz_id = quiz.id');
    joins.push('INNER JOIN quiz_tag filter_tag ON filter_tag.id = filter_tagging.quiz_tag_id AND filter_tag.slug = ?');
    joinValues.push(params.tagSlug);
  }

  if (params.q) {
    conditions.push('quiz.question LIKE ?');
    conditionValues.push(`%${params.q}%`);
  }

  const [rows] = await getMysqlPool().query<QuizCategoryQuizRow[]>(
    `
      SELECT
        quiz.id,
        quiz.slug,
        quiz.question,
        quiz.created_at,
        quiz.updated_at
      FROM quiz
      ${joins.join('\n')}
      WHERE ${conditions.join(' AND ')}
      ORDER BY quiz.id ASC
    `,
    [...joinValues, ...conditionValues],
  );

  const quizIds = rows.map((row) => Number(row.id));
  const tagsByQuizId = new Map<number, QuizCategoryQuizTag[]>();

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
      question: row.question,
      createdAt: serializeTimestamp(row.created_at),
      updatedAt: serializeTimestamp(row.updated_at),
      tags: tagsByQuizId.get(quizId) ?? [],
    };
  });
}

export async function getQuizCategoryQuizzes(
  categoryIdInput: string | number,
  params: QuizCategoryQuizzesParams = {},
): Promise<QuizCategoryQuizzesResult> {
  const categoryId = parseCategoryId(categoryIdInput);

  try {
    return {
      quizzes: await getQuizzesFromDb(categoryId, params),
      source: 'db',
    };
  } catch (error) {
    if (error instanceof QuizCategoryNotFoundError) {
      throw error;
    }

    console.error('Failed to fetch category quizzes from DB.', error);
    throw error;
  }
}

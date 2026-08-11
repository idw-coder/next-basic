import type { ResultSetHeader, RowDataPacket } from 'mysql2';

import { getMysqlPool } from '@/lib/server/mysql';

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
  source: 'db';
}

export interface QuizTagMutationResult {
  body:
    | { id: number; slug: string; name: string; quiz_count?: number }
    | { message: string; deletedId?: number; detachedCount?: number };
  status: 200 | 201;
  source: 'db';
}

export class QuizTagParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizTagParamsError';
  }
}

export class QuizTagConflictError extends Error {
  constructor() {
    super('Tag with this slug already exists');
    this.name = 'QuizTagConflictError';
  }
}

function normalizeTagPayload(payload: unknown): { slug?: string; name?: string } {
  const body = payload as { slug?: unknown; name?: unknown };

  return {
    ...(typeof body.slug === 'string' ? { slug: body.slug } : {}),
    ...(typeof body.name === 'string' ? { name: body.name } : {}),
  };
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

async function assertTagSlugAvailable(slug: string, excludeId?: number): Promise<void> {
  const [rows] = await getMysqlPool().query<RowDataPacket[]>(
    `
      SELECT id
      FROM quiz_tag
      WHERE slug = ?
        ${excludeId != null ? 'AND id <> ?' : ''}
      LIMIT 1
    `,
    excludeId != null ? [slug, excludeId] : [slug],
  );

  if (rows.length > 0) {
    throw new QuizTagConflictError();
  }
}

async function createTagInDb(rawPayload: unknown): Promise<QuizTagMutationResult> {
  const payload = normalizeTagPayload(rawPayload);
  if (!payload.slug || !payload.name) {
    throw new QuizTagParamsError('slug and name are required');
  }

  await assertTagSlugAvailable(payload.slug);

  const [result] = await getMysqlPool().query<ResultSetHeader>(
    `
      INSERT INTO quiz_tag
        (slug, name)
      VALUES (?, ?)
    `,
    [payload.slug, payload.name],
  );

  return {
    body: {
      id: Number(result.insertId),
      slug: payload.slug,
      name: payload.name,
      quiz_count: 0,
    },
    status: 201,
    source: 'db',
  };
}

export async function getQuizTags(): Promise<QuizTagsResult> {
  return {
    tags: await getTagsFromDb(),
    source: 'db',
  };
}

export async function createQuizTag(
  payload: unknown,
): Promise<QuizTagMutationResult> {
  try {
    return await createTagInDb(payload);
  } catch (error) {
    if (error instanceof QuizTagParamsError || error instanceof QuizTagConflictError) {
      throw error;
    }

    console.error('Failed to create tag in DB.', error);
    throw error;
  }
}

export {
  assertTagSlugAvailable,
  normalizeTagPayload,
};

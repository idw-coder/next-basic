import type { ResultSetHeader, RowDataPacket } from 'mysql2';

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

export interface QuizTagMutationResult {
  body:
    | { id: number; slug: string; name: string; quiz_count?: number }
    | { message: string; deletedId?: number; detachedCount?: number };
  status: 200 | 201;
  source: 'db' | 'express-fallback';
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

async function fetchTagsFromExpress(): Promise<QuizTag[]> {
  const res = await fetch(`${API_BASE_URL}/api/quiz/tags`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Express tags fallback failed: ${res.status}`);
  }

  return (await res.json()) as QuizTag[];
}

async function requestTagMutationFromExpress(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  payload: unknown,
  authorization: string | null,
): Promise<QuizTagMutationResult> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { authorization } : {}),
    },
    body: method === 'DELETE' ? undefined : JSON.stringify(payload),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(`Express tag mutation fallback failed: ${res.status}`);
  }

  return {
    body,
    status: res.status === 201 ? 201 : 200,
    source: 'express-fallback',
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

export async function createQuizTag(
  payload: unknown,
  authorization: string | null,
): Promise<QuizTagMutationResult> {
  try {
    return await createTagInDb(payload);
  } catch (error) {
    if (error instanceof QuizTagParamsError || error instanceof QuizTagConflictError) {
      throw error;
    }

    console.error('Failed to create tag in DB. Falling back to Express.', error);
    return requestTagMutationFromExpress('/api/quiz/tags', 'POST', payload, authorization);
  }
}

export {
  assertTagSlugAvailable,
  normalizeTagPayload,
  requestTagMutationFromExpress,
};

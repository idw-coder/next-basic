import type { ResultSetHeader, RowDataPacket } from 'mysql2';

import { getMysqlPool } from '@/lib/server/mysql';
import {
  QuizTagConflictError,
  QuizTagMutationResult,
  QuizTagParamsError,
  assertTagSlugAvailable,
  normalizeTagPayload,
  requestTagMutationFromExpress,
} from '@/lib/server/quizTags';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8888';

interface QuizTagDetailRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string;
}

interface QuizTagCountRow extends RowDataPacket {
  quizCount: number;
}

export interface QuizTagDetail {
  id: number;
  slug: string;
  name: string;
  quizCount: number;
}

export interface QuizTagDetailResult {
  tag: QuizTagDetail | null;
  source: 'db' | 'express-fallback' | 'unavailable';
}

export class QuizTagDetailParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizTagDetailParamsError';
  }
}

export class QuizTagDetailNotFoundError extends Error {
  constructor() {
    super('Tag not found');
    this.name = 'QuizTagDetailNotFoundError';
  }
}

function parseTagId(tagId: string | number): number {
  const parsed = Number(tagId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new QuizTagDetailParamsError('Invalid tag id');
  }

  return parsed;
}

async function fetchTagFromExpress(
  tagId: number,
  authorization: string | null,
): Promise<QuizTagDetail> {
  const res = await fetch(`${API_BASE_URL}/api/quiz/tags/${tagId}`, {
    cache: 'no-store',
    headers: authorization ? { authorization } : undefined,
  });

  if (res.status === 404) {
    throw new QuizTagDetailNotFoundError();
  }

  if (!res.ok) {
    throw new Error(`Express tag detail fallback failed: ${res.status}`);
  }

  return (await res.json()) as QuizTagDetail;
}

async function getTagFromDb(tagId: number): Promise<QuizTagDetail> {
  const [tagRows] = await getMysqlPool().query<QuizTagDetailRow[]>(
    `
      SELECT
        id,
        slug,
        name
      FROM quiz_tag
      WHERE id = ?
      LIMIT 1
    `,
    [tagId],
  );

  const tag = tagRows[0];
  if (!tag) {
    throw new QuizTagDetailNotFoundError();
  }

  const [countRows] = await getMysqlPool().query<QuizTagCountRow[]>(
    `
      SELECT COUNT(*) AS quizCount
      FROM quiz_tagging
      WHERE quiz_tag_id = ?
    `,
    [tagId],
  );

  return {
    id: Number(tag.id),
    slug: tag.slug,
    name: tag.name,
    quizCount: Number(countRows[0]?.quizCount ?? 0),
  };
}

export async function getQuizTagDetail(
  tagIdInput: string | number,
  authorization: string | null,
): Promise<QuizTagDetailResult> {
  const tagId = parseTagId(tagIdInput);

  try {
    return {
      tag: await getTagFromDb(tagId),
      source: 'db',
    };
  } catch (error) {
    if (error instanceof QuizTagDetailNotFoundError) {
      throw error;
    }

    console.error('Failed to fetch tag detail from DB. Falling back to Express.', error);

    try {
      return {
        tag: await fetchTagFromExpress(tagId, authorization),
        source: 'express-fallback',
      };
    } catch (fallbackError) {
      if (fallbackError instanceof QuizTagDetailNotFoundError) {
        throw fallbackError;
      }

      console.error('Failed to fetch tag detail from Express fallback.', fallbackError);

      return {
        tag: null,
        source: 'unavailable',
      };
    }
  }
}

async function updateTagInDb(
  tagId: number,
  rawPayload: unknown,
): Promise<QuizTagMutationResult> {
  await getTagFromDb(tagId);
  const payload = normalizeTagPayload(rawPayload);

  if (payload.slug !== undefined) {
    await assertTagSlugAvailable(payload.slug, tagId);
  }

  await getMysqlPool().query(
    `
      UPDATE quiz_tag
      SET
        slug = COALESCE(?, slug),
        name = COALESCE(?, name)
      WHERE id = ?
    `,
    [payload.slug ?? null, payload.name ?? null, tagId],
  );

  const tag = await getTagFromDb(tagId);
  return {
    body: {
      id: tag.id,
      slug: tag.slug,
      name: tag.name,
    },
    status: 200,
    source: 'db',
  };
}

async function deleteTagFromDb(tagId: number): Promise<QuizTagMutationResult> {
  const connection = await getMysqlPool().getConnection();

  try {
    await connection.beginTransaction();

    const [tagRows] = await connection.query<QuizTagDetailRow[]>(
      `
        SELECT id, slug, name
        FROM quiz_tag
        WHERE id = ?
        LIMIT 1
      `,
      [tagId],
    );

    if (!tagRows[0]) {
      throw new QuizTagDetailNotFoundError();
    }

    const [detached] = await connection.query<ResultSetHeader>(
      `
        DELETE FROM quiz_tagging
        WHERE quiz_tag_id = ?
      `,
      [tagId],
    );

    await connection.query(
      `
        DELETE FROM quiz_tag
        WHERE id = ?
      `,
      [tagId],
    );

    await connection.commit();

    return {
      body: {
        message: 'Tag deleted',
        deletedId: tagId,
        detachedCount: Number(detached.affectedRows),
      },
      status: 200,
      source: 'db',
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateQuizTag(
  tagIdInput: string | number,
  payload: unknown,
  authorization: string | null,
): Promise<QuizTagMutationResult> {
  const tagId = parseTagId(tagIdInput);

  try {
    return await updateTagInDb(tagId, payload);
  } catch (error) {
    if (
      error instanceof QuizTagDetailNotFoundError ||
      error instanceof QuizTagParamsError ||
      error instanceof QuizTagConflictError
    ) {
      throw error;
    }

    console.error('Failed to update tag in DB. Falling back to Express.', error);
    return requestTagMutationFromExpress(
      `/api/quiz/tags/${tagId}`,
      'PUT',
      payload,
      authorization,
    );
  }
}

export async function deleteQuizTag(
  tagIdInput: string | number,
  authorization: string | null,
): Promise<QuizTagMutationResult> {
  const tagId = parseTagId(tagIdInput);

  try {
    return await deleteTagFromDb(tagId);
  } catch (error) {
    if (error instanceof QuizTagDetailNotFoundError || error instanceof QuizTagParamsError) {
      throw error;
    }

    console.error('Failed to delete tag in DB. Falling back to Express.', error);
    return requestTagMutationFromExpress(
      `/api/quiz/tags/${tagId}`,
      'DELETE',
      undefined,
      authorization,
    );
  }
}

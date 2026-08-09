import type { ResultSetHeader, RowDataPacket } from 'mysql2';

import { getMysqlPool } from '@/lib/server/mysql';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8888';

interface QuizHistoryRow extends RowDataPacket {
  quiz_id: number;
  category_id: number;
  is_correct: number | boolean;
  answered_at: Date | string;
}

export interface QuizHistoryAnswer {
  quizId: number;
  categoryId: number;
  isCorrect: boolean;
  answeredAt: string;
}

export interface QuizHistoryAddResult {
  body: { id: number } | { message: 'already exists' };
  status: 201 | 200;
  source: 'db' | 'express-fallback';
}

export interface QuizHistoryResult {
  answers: QuizHistoryAnswer[];
  source: 'db' | 'express-fallback' | 'unavailable';
}

export interface QuizHistorySyncResult {
  synced: number;
  source: 'db' | 'express-fallback';
}

export class QuizHistoryParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizHistoryParamsError';
  }
}

function serializeTimestamp(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function parseAnsweredAt(answeredAt: string): Date {
  const parsed = new Date(answeredAt);
  if (!Number.isFinite(parsed.getTime())) {
    throw new QuizHistoryParamsError('Invalid answeredAt');
  }

  parsed.setMilliseconds(0);
  return parsed;
}

function assertAnswerPayload(value: unknown): QuizHistoryAnswer {
  const payload = value as Partial<QuizHistoryAnswer> | null;
  if (
    !payload ||
    !payload.quizId ||
    !payload.categoryId ||
    payload.isCorrect == null ||
    !payload.answeredAt
  ) {
    throw new QuizHistoryParamsError('quizId, categoryId, isCorrect, answeredAt are required');
  }

  return {
    quizId: Number(payload.quizId),
    categoryId: Number(payload.categoryId),
    isCorrect:
      typeof payload.isCorrect === 'boolean'
        ? payload.isCorrect
        : Boolean(Number(payload.isCorrect)),
    answeredAt: String(payload.answeredAt),
  };
}

function collectValidAnswers(values: unknown[]): QuizHistoryAnswer[] {
  const answers: QuizHistoryAnswer[] = [];

  for (const value of values) {
    try {
      answers.push(assertAnswerPayload(value));
    } catch (error) {
      if (error instanceof QuizHistoryParamsError) {
        continue;
      }
      throw error;
    }
  }

  return answers;
}

async function fetchHistoryFromExpress(
  authorization: string | null,
): Promise<QuizHistoryAnswer[]> {
  const res = await fetch(`${API_BASE_URL}/api/quiz/history`, {
    cache: 'no-store',
    headers: authorization ? { authorization } : undefined,
  });

  if (!res.ok) {
    throw new Error(`Express quiz history fallback failed: ${res.status}`);
  }

  return (await res.json()) as QuizHistoryAnswer[];
}

async function postAnswerToExpress(
  payload: QuizHistoryAnswer,
  authorization: string | null,
): Promise<QuizHistoryAddResult> {
  const res = await fetch(`${API_BASE_URL}/api/quiz/history`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { authorization } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Express quiz history add fallback failed: ${res.status}`);
  }

  return {
    body: await res.json(),
    status: res.status === 201 ? 201 : 200,
    source: 'express-fallback',
  };
}

async function syncHistoryToExpress(
  answers: QuizHistoryAnswer[],
  authorization: string | null,
): Promise<QuizHistorySyncResult> {
  const res = await fetch(`${API_BASE_URL}/api/quiz/history/sync`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { authorization } : {}),
    },
    body: JSON.stringify({ answers }),
  });

  if (!res.ok) {
    throw new Error(`Express quiz history sync fallback failed: ${res.status}`);
  }

  const body = (await res.json()) as { synced?: number };
  return {
    synced: Number(body.synced ?? 0),
    source: 'express-fallback',
  };
}

async function getHistoryFromDb(userId: number): Promise<QuizHistoryAnswer[]> {
  const [rows] = await getMysqlPool().query<QuizHistoryRow[]>(
    `
      SELECT
        quiz_id,
        category_id,
        is_correct,
        answered_at
      FROM quiz_answers
      WHERE user_id = ?
      ORDER BY answered_at DESC
    `,
    [userId],
  );

  return rows.map((row) => ({
    quizId: Number(row.quiz_id),
    categoryId: Number(row.category_id),
    isCorrect: Boolean(Number(row.is_correct)),
    answeredAt: serializeTimestamp(row.answered_at),
  }));
}

async function addAnswerToDb(
  userId: number,
  payload: QuizHistoryAnswer,
): Promise<QuizHistoryAddResult> {
  const [result] = await getMysqlPool().query<ResultSetHeader>(
    `
      INSERT IGNORE INTO quiz_answers
        (user_id, quiz_id, category_id, is_correct, answered_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      userId,
      payload.quizId,
      payload.categoryId,
      payload.isCorrect,
      parseAnsweredAt(payload.answeredAt),
    ],
  );

  if (result.affectedRows === 0) {
    return {
      body: { message: 'already exists' },
      status: 200,
      source: 'db',
    };
  }

  return {
    body: { id: Number(result.insertId) },
    status: 201,
    source: 'db',
  };
}

async function syncHistoryToDb(userId: number, answers: QuizHistoryAnswer[]): Promise<number> {
  let synced = 0;

  for (const rawAnswer of answers) {
    try {
      const answer = assertAnswerPayload(rawAnswer);
      const result = await addAnswerToDb(userId, answer);
      if (result.status === 201) {
        synced += 1;
      }
    } catch (error) {
      if (error instanceof QuizHistoryParamsError) {
        continue;
      }
      throw error;
    }
  }

  return synced;
}

export async function getQuizHistory(
  userId: number,
  authorization: string | null,
): Promise<QuizHistoryResult> {
  try {
    return {
      answers: await getHistoryFromDb(userId),
      source: 'db',
    };
  } catch (error) {
    console.error('Failed to fetch quiz history from DB. Falling back to Express.', error);

    try {
      return {
        answers: await fetchHistoryFromExpress(authorization),
        source: 'express-fallback',
      };
    } catch (fallbackError) {
      console.error('Failed to fetch quiz history from Express fallback.', fallbackError);

      return {
        answers: [],
        source: 'unavailable',
      };
    }
  }
}

export async function addQuizHistoryAnswer(
  userId: number,
  rawPayload: unknown,
  authorization: string | null,
): Promise<QuizHistoryAddResult> {
  const payload = assertAnswerPayload(rawPayload);

  try {
    return await addAnswerToDb(userId, payload);
  } catch (error) {
    if (error instanceof QuizHistoryParamsError) {
      throw error;
    }

    console.error('Failed to add quiz history to DB. Falling back to Express.', error);
    return postAnswerToExpress(payload, authorization);
  }
}

export async function syncQuizHistory(
  userId: number,
  rawPayload: unknown,
  authorization: string | null,
): Promise<QuizHistorySyncResult> {
  const payload = rawPayload as { answers?: unknown } | null;
  const answers = Array.isArray(payload?.answers) ? collectValidAnswers(payload.answers) : [];

  if (answers.length === 0) {
    return {
      synced: 0,
      source: 'db',
    };
  }

  try {
    return {
      synced: await syncHistoryToDb(userId, answers),
      source: 'db',
    };
  } catch (error) {
    if (error instanceof QuizHistoryParamsError) {
      throw error;
    }

    console.error('Failed to sync quiz history to DB. Falling back to Express.', error);
    return syncHistoryToExpress(answers, authorization);
  }
}

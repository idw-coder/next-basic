import type { RowDataPacket } from 'mysql2';

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

export interface QuizHistoryResult {
  answers: QuizHistoryAnswer[];
  source: 'db' | 'express-fallback' | 'unavailable';
}

function serializeTimestamp(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
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

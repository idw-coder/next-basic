import type { RowDataPacket } from 'mysql2';

import { getMysqlPool } from '@/lib/server/mysql';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8888';

interface QuizDetailRow extends RowDataPacket {
  id: number;
  slug: string;
  category_id: number;
  question: string;
  explanation: string | null;
}

interface QuizChoiceRow extends RowDataPacket {
  id: number;
  choice_text: string;
  is_correct: number | boolean;
  display_order: number | null;
}

interface QuizTagRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string;
}

export interface QuizDetailChoice {
  id: number;
  choice_text: string;
  is_correct: boolean;
  display_order?: number;
}

export interface QuizDetailTag {
  id: number;
  slug: string;
  name: string;
}

export interface QuizDetail {
  id: number;
  slug: string;
  category_id: number;
  question: string;
  explanation?: string;
  choices: QuizDetailChoice[];
  tags: QuizDetailTag[];
}

export interface QuizDetailResult {
  quiz: QuizDetail | null;
  source: 'db' | 'express-fallback' | 'unavailable';
}

export class QuizDetailParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizDetailParamsError';
  }
}

export class QuizDetailNotFoundError extends Error {
  constructor() {
    super('Quiz not found');
    this.name = 'QuizDetailNotFoundError';
  }
}

function parseQuizId(quizId: string | number): number {
  const parsed = Number(quizId);
  if (!Number.isFinite(parsed)) {
    throw new QuizDetailParamsError('Invalid quiz id');
  }

  return parsed;
}

async function fetchQuizFromExpress(quizId: number): Promise<QuizDetail> {
  const res = await fetch(`${API_BASE_URL}/api/quiz/${quizId}`, {
    cache: 'no-store',
  });

  if (res.status === 404) {
    throw new QuizDetailNotFoundError();
  }

  if (!res.ok) {
    throw new Error(`Express quiz detail fallback failed: ${res.status}`);
  }

  return (await res.json()) as QuizDetail;
}

async function getQuizFromDb(quizId: number): Promise<QuizDetail> {
  const [quizRows] = await getMysqlPool().query<QuizDetailRow[]>(
    `
      SELECT
        id,
        slug,
        category_id,
        question,
        explanation
      FROM quiz
      WHERE id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [quizId],
  );

  const quiz = quizRows[0];
  if (!quiz) {
    throw new QuizDetailNotFoundError();
  }

  const [choiceRows] = await getMysqlPool().query<QuizChoiceRow[]>(
    `
      SELECT
        id,
        choice_text,
        is_correct,
        display_order
      FROM quiz_choice
      WHERE quiz_id = ?
      ORDER BY COALESCE(display_order, 0) ASC, id ASC
    `,
    [quizId],
  );

  const [tagRows] = await getMysqlPool().query<QuizTagRow[]>(
    `
      SELECT
        tag.id,
        tag.slug,
        tag.name
      FROM quiz_tagging tagging
      INNER JOIN quiz_tag tag ON tag.id = tagging.quiz_tag_id
      WHERE tagging.quiz_id = ?
      ORDER BY tag.slug ASC
    `,
    [quizId],
  );

  return {
    id: Number(quiz.id),
    slug: quiz.slug,
    category_id: Number(quiz.category_id),
    question: quiz.question,
    ...(quiz.explanation != null ? { explanation: quiz.explanation } : {}),
    choices: choiceRows.map((choice) => ({
      id: Number(choice.id),
      choice_text: choice.choice_text,
      is_correct: Boolean(Number(choice.is_correct)),
      ...(choice.display_order != null ? { display_order: Number(choice.display_order) } : {}),
    })),
    tags: tagRows.map((tag) => ({
      id: Number(tag.id),
      slug: tag.slug,
      name: tag.name,
    })),
  };
}

export async function getQuizDetail(quizIdInput: string | number): Promise<QuizDetailResult> {
  const quizId = parseQuizId(quizIdInput);

  try {
    return {
      quiz: await getQuizFromDb(quizId),
      source: 'db',
    };
  } catch (error) {
    if (error instanceof QuizDetailNotFoundError) {
      throw error;
    }

    console.error('Failed to fetch quiz detail from DB. Falling back to Express.', error);

    try {
      return {
        quiz: await fetchQuizFromExpress(quizId),
        source: 'express-fallback',
      };
    } catch (fallbackError) {
      if (fallbackError instanceof QuizDetailNotFoundError) {
        throw fallbackError;
      }

      console.error('Failed to fetch quiz detail from Express fallback.', fallbackError);

      return {
        quiz: null,
        source: 'unavailable',
      };
    }
  }
}

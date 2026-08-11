import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { getMysqlPool } from '@/lib/server/mysql';

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
  source: 'db';
}

export interface QuizMutationResult {
  body: QuizDetail | { message: string };
  status: 200 | 201;
  source: 'db';
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

export class QuizDetailConflictError extends Error {
  constructor() {
    super('Quiz with this slug already exists');
    this.name = 'QuizDetailConflictError';
  }
}

export class QuizCategoryNotFoundError extends Error {
  constructor() {
    super('Category not found');
    this.name = 'QuizCategoryNotFoundError';
  }
}

export class QuizTagNotFoundError extends Error {
  constructor(tagSlug: string) {
    super(`Tag not found: ${tagSlug}`);
    this.name = 'QuizTagNotFoundError';
  }
}

function parseQuizId(quizId: string | number): number {
  const parsed = Number(quizId);
  if (!Number.isFinite(parsed)) {
    throw new QuizDetailParamsError('Invalid quiz id');
  }

  return parsed;
}

function parsePositiveQuizId(quizId: string | number): number {
  const parsed = Number(quizId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new QuizDetailParamsError('Invalid quiz id');
  }

  return parsed;
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

interface QuizPayloadChoice {
  choice_text: string;
  is_correct: boolean;
  display_order?: number;
}

interface NormalizedQuizPayload {
  category_id?: number;
  slug?: string;
  question?: string;
  explanation?: string;
  choices?: QuizPayloadChoice[];
  tags?: string[];
}

function normalizeQuizPayload(payload: unknown): NormalizedQuizPayload {
  const body = payload as {
    category_id?: unknown;
    slug?: unknown;
    question?: unknown;
    explanation?: unknown;
    choices?: unknown;
    tags?: unknown;
  };

  return {
    ...(body.category_id != null ? { category_id: Number(body.category_id) } : {}),
    ...(typeof body.slug === 'string' ? { slug: body.slug } : {}),
    ...(typeof body.question === 'string' ? { question: body.question } : {}),
    ...(typeof body.explanation === 'string' ? { explanation: body.explanation } : {}),
    ...(Array.isArray(body.choices)
      ? {
          choices: body.choices.map((choice, index) => {
            const item = choice as {
              choice_text?: unknown;
              is_correct?: unknown;
              display_order?: unknown;
            };

            return {
              choice_text: typeof item.choice_text === 'string' ? item.choice_text : '',
              is_correct: Boolean(item.is_correct),
              ...(item.display_order != null
                ? { display_order: Number(item.display_order) }
                : { display_order: index + 1 }),
            };
          }),
        }
      : {}),
    ...(Array.isArray(body.tags)
      ? { tags: body.tags.filter((tag): tag is string => typeof tag === 'string') }
      : {}),
  };
}

async function assertCategoryExists(connection: PoolConnection, categoryId: number): Promise<void> {
  const [rows] = await connection.query<RowDataPacket[]>(
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

async function assertQuizSlugAvailable(
  connection: PoolConnection,
  slug: string,
  excludeId?: number,
): Promise<void> {
  const [rows] = await connection.query<RowDataPacket[]>(
    `
      SELECT id
      FROM quiz
      WHERE slug = ?
        AND deleted_at IS NULL
        ${excludeId != null ? 'AND id <> ?' : ''}
      LIMIT 1
    `,
    excludeId != null ? [slug, excludeId] : [slug],
  );

  if (rows.length > 0) {
    throw new QuizDetailConflictError();
  }
}

async function getQuizTagIdsBySlug(
  connection: PoolConnection,
  tagSlugs: string[],
): Promise<number[]> {
  const tagIds: number[] = [];

  for (const tagSlug of tagSlugs) {
    const [rows] = await connection.query<QuizTagRow[]>(
      `
        SELECT id, slug, name
        FROM quiz_tag
        WHERE slug = ?
        LIMIT 1
      `,
      [tagSlug],
    );

    const tag = rows[0];
    if (!tag) {
      throw new QuizTagNotFoundError(tagSlug);
    }

    tagIds.push(Number(tag.id));
  }

  return tagIds;
}

async function insertQuizChoices(
  connection: PoolConnection,
  quizId: number,
  choices: QuizPayloadChoice[],
): Promise<void> {
  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i];
    if (!choice) continue;

    await connection.query(
      `
        INSERT INTO quiz_choice
          (quiz_id, choice_text, is_correct, display_order)
        VALUES (?, ?, ?, ?)
      `,
      [
        quizId,
        choice.choice_text,
        choice.is_correct ? 1 : 0,
        choice.display_order ?? i + 1,
      ],
    );
  }
}

async function insertQuizTaggings(
  connection: PoolConnection,
  quizId: number,
  tagSlugs: string[],
): Promise<void> {
  const tagIds = await getQuizTagIdsBySlug(connection, tagSlugs);

  for (const tagId of tagIds) {
    await connection.query(
      `
        INSERT INTO quiz_tagging
          (quiz_id, quiz_tag_id)
        VALUES (?, ?)
      `,
      [quizId, tagId],
    );
  }
}

async function createQuizInDb(
  userId: number,
  rawPayload: unknown,
): Promise<QuizMutationResult> {
  const payload = normalizeQuizPayload(rawPayload);

  if (!payload.category_id || !payload.slug || !payload.question) {
    throw new QuizDetailParamsError('category_id, slug, question are required');
  }

  const choices = Array.isArray(payload.choices) ? payload.choices : [];
  if (choices.length === 0) {
    throw new QuizDetailParamsError('At least one choice is required');
  }

  const connection = await getMysqlPool().getConnection();

  try {
    await connection.beginTransaction();
    await assertCategoryExists(connection, payload.category_id);
    await assertQuizSlugAvailable(connection, payload.slug);

    const [result] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO quiz
          (slug, category_id, author_id, question, explanation)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        payload.slug,
        payload.category_id,
        userId,
        payload.question,
        payload.explanation != null && payload.explanation !== '' ? payload.explanation : null,
      ],
    );

    const quizId = Number(result.insertId);
    await insertQuizChoices(connection, quizId, choices);

    if (payload.tags && payload.tags.length > 0) {
      await insertQuizTaggings(connection, quizId, payload.tags);
    }

    await connection.commit();

    return {
      body: await getQuizFromDb(quizId),
      status: 201,
      source: 'db',
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateQuizInDb(
  quizId: number,
  rawPayload: unknown,
): Promise<QuizMutationResult> {
  const payload = normalizeQuizPayload(rawPayload);
  const connection = await getMysqlPool().getConnection();

  try {
    await connection.beginTransaction();

    const [quizRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT id
        FROM quiz
        WHERE id = ?
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [quizId],
    );

    if (!quizRows[0]) {
      throw new QuizDetailNotFoundError();
    }

    if (payload.category_id != null) {
      await assertCategoryExists(connection, payload.category_id);
    }

    if (payload.slug !== undefined) {
      await assertQuizSlugAvailable(connection, payload.slug, quizId);
    }

    await connection.query(
      `
        UPDATE quiz
        SET
          slug = COALESCE(?, slug),
          category_id = COALESCE(?, category_id),
          question = COALESCE(?, question),
          explanation = COALESCE(?, explanation)
        WHERE id = ?
          AND deleted_at IS NULL
      `,
      [
        payload.slug ?? null,
        payload.category_id ?? null,
        payload.question ?? null,
        payload.explanation ?? null,
        quizId,
      ],
    );

    if (Array.isArray(payload.choices) && payload.choices.length > 0) {
      await connection.query(
        `
          DELETE FROM quiz_choice
          WHERE quiz_id = ?
        `,
        [quizId],
      );
      await insertQuizChoices(connection, quizId, payload.choices);
    }

    if (Array.isArray(payload.tags)) {
      await connection.query(
        `
          DELETE FROM quiz_tagging
          WHERE quiz_id = ?
        `,
        [quizId],
      );
      await insertQuizTaggings(connection, quizId, payload.tags);
    }

    await connection.commit();

    return {
      body: await getQuizFromDb(quizId),
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

async function deleteQuizFromDb(quizId: number): Promise<QuizMutationResult> {
  const [result] = await getMysqlPool().query<ResultSetHeader>(
    `
      UPDATE quiz
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
    `,
    [quizId],
  );

  if (result.affectedRows === 0) {
    throw new QuizDetailNotFoundError();
  }

  return {
    body: { message: 'Quiz deleted' },
    status: 200,
    source: 'db',
  };
}

export async function getQuizDetail(quizIdInput: string | number): Promise<QuizDetailResult> {
  const quizId = parseQuizId(quizIdInput);

  return {
    quiz: await getQuizFromDb(quizId),
    source: 'db',
  };
}

export async function createQuiz(
  userId: number,
  payload: unknown,
): Promise<QuizMutationResult> {
  try {
    return await createQuizInDb(userId, payload);
  } catch (error) {
    if (
      error instanceof QuizDetailParamsError ||
      error instanceof QuizDetailConflictError ||
      error instanceof QuizCategoryNotFoundError ||
      error instanceof QuizTagNotFoundError
    ) {
      throw error;
    }

    console.error('Failed to create quiz in DB.', error);
    throw error;
  }
}

export async function updateQuiz(
  quizIdInput: string | number,
  payload: unknown,
): Promise<QuizMutationResult> {
  const quizId = parsePositiveQuizId(quizIdInput);

  try {
    return await updateQuizInDb(quizId, payload);
  } catch (error) {
    if (
      error instanceof QuizDetailParamsError ||
      error instanceof QuizDetailConflictError ||
      error instanceof QuizDetailNotFoundError ||
      error instanceof QuizCategoryNotFoundError ||
      error instanceof QuizTagNotFoundError
    ) {
      throw error;
    }

    console.error('Failed to update quiz in DB.', error);
    throw error;
  }
}

export async function deleteQuiz(
  quizIdInput: string | number,
): Promise<QuizMutationResult> {
  const quizId = parsePositiveQuizId(quizIdInput);

  try {
    return await deleteQuizFromDb(quizId);
  } catch (error) {
    if (error instanceof QuizDetailParamsError || error instanceof QuizDetailNotFoundError) {
      throw error;
    }

    console.error('Failed to delete quiz in DB.', error);
    throw error;
  }
}

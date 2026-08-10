import type { ResultSetHeader, RowDataPacket } from 'mysql2';

import { getMysqlPool } from '@/lib/server/mysql';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8888';

interface QuizCategoryRow extends RowDataPacket {
  id: number;
  slug: string;
  category_name: string;
  description: string | null;
  display_order: number | null;
  quiz_count: number | string;
}

export interface QuizCategory {
  id: number;
  slug: string;
  category_name: string;
  description: string | null;
  display_order: number | null;
  quiz_count: number;
}

export interface QuizCategoriesResult {
  categories: QuizCategory[];
  source: 'db' | 'express-fallback' | 'unavailable';
}

export interface QuizCategoryMutationResult {
  body: QuizCategory | { message: string };
  status: 200 | 201;
  source: 'db' | 'express-fallback';
}

export class QuizCategoryParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizCategoryParamsError';
  }
}

export class QuizCategoryConflictError extends Error {
  constructor() {
    super('Category with this slug already exists');
    this.name = 'QuizCategoryConflictError';
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
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new QuizCategoryParamsError('Invalid category id');
  }

  return parsed;
}

async function fetchCategoriesFromExpress(): Promise<QuizCategory[]> {
  const res = await fetch(`${API_BASE_URL}/api/quiz/categories`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Express categories fallback failed: ${res.status}`);
  }

  return (await res.json()) as QuizCategory[];
}

async function requestCategoryMutationFromExpress(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  payload: unknown,
  authorization: string | null,
): Promise<QuizCategoryMutationResult> {
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
    throw new Error(`Express category mutation fallback failed: ${res.status}`);
  }

  return {
    body,
    status: res.status === 201 ? 201 : 200,
    source: 'express-fallback',
  };
}

async function getCategoriesFromDb(): Promise<QuizCategory[]> {
  const [rows] = await getMysqlPool().query<QuizCategoryRow[]>(`
    SELECT
      c.id,
      c.slug,
      c.category_name,
      c.description,
      c.display_order,
      COUNT(q.id) AS quiz_count
    FROM quiz_category c
    LEFT JOIN quiz q ON q.category_id = c.id
    WHERE c.deleted_at IS NULL
    GROUP BY c.id, c.slug, c.category_name, c.description, c.display_order
    ORDER BY COALESCE(c.display_order, c.id), c.id
  `);

  return rows.map((row) => ({
    id: Number(row.id),
    slug: row.slug,
    category_name: row.category_name,
    description: row.description,
    display_order: row.display_order === null ? null : Number(row.display_order),
    quiz_count: Number(row.quiz_count),
  }));
}

function normalizeCategoryPayload(payload: unknown): {
  slug?: string;
  category_name?: string;
  description?: string;
  thumbnail_path?: string;
  display_order?: number;
} {
  const body = payload as {
    slug?: unknown;
    category_name?: unknown;
    description?: unknown;
    thumbnail_path?: unknown;
    display_order?: unknown;
  };

  return {
    ...(typeof body.slug === 'string' ? { slug: body.slug } : {}),
    ...(typeof body.category_name === 'string' ? { category_name: body.category_name } : {}),
    ...(typeof body.description === 'string' ? { description: body.description } : {}),
    ...(typeof body.thumbnail_path === 'string' ? { thumbnail_path: body.thumbnail_path } : {}),
    ...(body.display_order != null ? { display_order: Number(body.display_order) } : {}),
  };
}

async function getCategoryById(categoryId: number): Promise<QuizCategory> {
  const [rows] = await getMysqlPool().query<QuizCategoryRow[]>(
    `
      SELECT
        c.id,
        c.slug,
        c.category_name,
        c.description,
        c.display_order,
        COUNT(q.id) AS quiz_count
      FROM quiz_category c
      LEFT JOIN quiz q ON q.category_id = c.id
      WHERE c.id = ?
        AND c.deleted_at IS NULL
      GROUP BY c.id, c.slug, c.category_name, c.description, c.display_order
      LIMIT 1
    `,
    [categoryId],
  );

  const row = rows[0];
  if (!row) {
    throw new QuizCategoryNotFoundError();
  }

  return {
    id: Number(row.id),
    slug: row.slug,
    category_name: row.category_name,
    description: row.description,
    display_order: row.display_order === null ? null : Number(row.display_order),
    quiz_count: Number(row.quiz_count),
  };
}

async function assertCategorySlugAvailable(slug: string, excludeId?: number): Promise<void> {
  const [rows] = await getMysqlPool().query<RowDataPacket[]>(
    `
      SELECT id
      FROM quiz_category
      WHERE slug = ?
        AND deleted_at IS NULL
        ${excludeId != null ? 'AND id <> ?' : ''}
      LIMIT 1
    `,
    excludeId != null ? [slug, excludeId] : [slug],
  );

  if (rows.length > 0) {
    throw new QuizCategoryConflictError();
  }
}

async function createCategoryInDb(
  userId: number,
  rawPayload: unknown,
): Promise<QuizCategoryMutationResult> {
  const payload = normalizeCategoryPayload(rawPayload);
  if (!payload.slug || !payload.category_name) {
    throw new QuizCategoryParamsError('slug and category_name are required');
  }

  await assertCategorySlugAvailable(payload.slug);

  const [result] = await getMysqlPool().query<ResultSetHeader>(
    `
      INSERT INTO quiz_category
        (slug, category_name, author_id, description, thumbnail_path, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      payload.slug,
      payload.category_name,
      userId,
      payload.description ?? null,
      payload.thumbnail_path ?? null,
      payload.display_order ?? null,
    ],
  );

  return {
    body: await getCategoryById(Number(result.insertId)),
    status: 201,
    source: 'db',
  };
}

async function updateCategoryInDb(
  categoryId: number,
  rawPayload: unknown,
): Promise<QuizCategoryMutationResult> {
  await getCategoryById(categoryId);
  const payload = normalizeCategoryPayload(rawPayload);

  if (payload.slug !== undefined) {
    await assertCategorySlugAvailable(payload.slug, categoryId);
  }

  await getMysqlPool().query(
    `
      UPDATE quiz_category
      SET
        slug = COALESCE(?, slug),
        category_name = COALESCE(?, category_name),
        description = COALESCE(?, description),
        thumbnail_path = COALESCE(?, thumbnail_path),
        display_order = COALESCE(?, display_order)
      WHERE id = ?
        AND deleted_at IS NULL
    `,
    [
      payload.slug ?? null,
      payload.category_name ?? null,
      payload.description ?? null,
      payload.thumbnail_path ?? null,
      payload.display_order ?? null,
      categoryId,
    ],
  );

  return {
    body: await getCategoryById(categoryId),
    status: 200,
    source: 'db',
  };
}

async function deleteCategoryInDb(categoryId: number): Promise<QuizCategoryMutationResult> {
  await getCategoryById(categoryId);
  await getMysqlPool().query(
    `
      UPDATE quiz_category
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND deleted_at IS NULL
    `,
    [categoryId],
  );

  return {
    body: { message: 'Category deleted' },
    status: 200,
    source: 'db',
  };
}

export async function getQuizCategories(): Promise<QuizCategoriesResult> {
  try {
    return {
      categories: await getCategoriesFromDb(),
      source: 'db',
    };
  } catch (error) {
    console.error('Failed to fetch categories from DB. Falling back to Express.', error);

    try {
      return {
        categories: await fetchCategoriesFromExpress(),
        source: 'express-fallback',
      };
    } catch (fallbackError) {
      console.error('Failed to fetch categories from Express fallback.', fallbackError);

      return {
        categories: [],
        source: 'unavailable',
      };
    }
  }
}

export async function createQuizCategory(
  userId: number,
  payload: unknown,
  authorization: string | null,
): Promise<QuizCategoryMutationResult> {
  try {
    return await createCategoryInDb(userId, payload);
  } catch (error) {
    if (
      error instanceof QuizCategoryParamsError ||
      error instanceof QuizCategoryConflictError
    ) {
      throw error;
    }

    console.error('Failed to create category in DB. Falling back to Express.', error);
    return requestCategoryMutationFromExpress('/api/quiz/categories', 'POST', payload, authorization);
  }
}

export async function updateQuizCategory(
  categoryIdInput: string | number,
  payload: unknown,
  authorization: string | null,
): Promise<QuizCategoryMutationResult> {
  const categoryId = parseCategoryId(categoryIdInput);

  try {
    return await updateCategoryInDb(categoryId, payload);
  } catch (error) {
    if (
      error instanceof QuizCategoryParamsError ||
      error instanceof QuizCategoryConflictError ||
      error instanceof QuizCategoryNotFoundError
    ) {
      throw error;
    }

    console.error('Failed to update category in DB. Falling back to Express.', error);
    return requestCategoryMutationFromExpress(
      `/api/quiz/categories/${categoryId}`,
      'PUT',
      payload,
      authorization,
    );
  }
}

export async function deleteQuizCategory(
  categoryIdInput: string | number,
  authorization: string | null,
): Promise<QuizCategoryMutationResult> {
  const categoryId = parseCategoryId(categoryIdInput);

  try {
    return await deleteCategoryInDb(categoryId);
  } catch (error) {
    if (error instanceof QuizCategoryParamsError || error instanceof QuizCategoryNotFoundError) {
      throw error;
    }

    console.error('Failed to delete category in DB. Falling back to Express.', error);
    return requestCategoryMutationFromExpress(
      `/api/quiz/categories/${categoryId}`,
      'DELETE',
      undefined,
      authorization,
    );
  }
}

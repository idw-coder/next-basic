import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { getMysqlPool } from '@/lib/server/mysql';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8888';

const CSV_HEADERS = [
  'category_slug',
  'quiz_slug',
  'question',
  'explanation',
  'choice_text',
  'is_correct',
  'choice_order',
  'tags',
] as const;

interface CsvRow {
  category_slug: string;
  quiz_slug: string;
  question: string;
  explanation: string;
  choice_text: string;
  is_correct: string;
  choice_order: string;
  tags: string;
}

interface ExportRow extends RowDataPacket {
  quiz_id: number;
  category_slug: string;
  quiz_slug: string;
  question: string;
  explanation: string | null;
  choice_text: string | null;
  is_correct: number | boolean | null;
  choice_order: number | null;
}

interface CategoryRow extends RowDataPacket {
  id: number;
  slug: string;
}

interface TagRow extends RowDataPacket {
  id: number;
  slug: string;
}

interface QuizRow extends RowDataPacket {
  id: number;
}

interface QuizTagSlugRow extends RowDataPacket {
  quiz_id: number;
  tag_slug: string;
}

export interface QuizCsvExportResult {
  csv: string;
  filename: string;
  source: 'db' | 'express-fallback';
}

export interface QuizCsvImportResult {
  body: {
    message: string;
    created_count: number;
    updated_count: number;
    error_count: number;
    created_tags_count: number;
    created: string[];
    updated: string[];
    errors: string[];
    created_tags: string[];
  };
  source: 'db' | 'express-fallback';
}

export class QuizCsvParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizCsvParamsError';
  }
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function toCsvString(rows: string[][]): string {
  return `${rows.map((row) => row.map(escapeCsvField).join(',')).join('\r\n')}\r\n`;
}

function parseCsv(content: string): CsvRow[] {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === undefined) continue;

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < content.length && content[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(current.trim());
      current = '';
    } else if (ch === '\r') {
      // skip, handle line breaks on \n
    } else if (ch === '\n') {
      row.push(current.trim());
      current = '';
      if (row.some((cell) => cell !== '')) {
        rows.push(row);
      }
      row = [];
    } else {
      current += ch;
    }
  }

  if (current !== '' || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell !== '')) {
      rows.push(row);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0] ?? [];
  return rows.slice(1).map((csvRow) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i] ?? ''] = csvRow[i] ?? '';
    }
    return obj as unknown as CsvRow;
  });
}

export function createSampleQuizCsv(): string {
  return `\uFEFF${toCsvString([
    CSV_HEADERS as unknown as string[],
    [
      'javascript',
      'js-var-let',
      'letとconstの違いは何ですか？',
      'letは再代入可能、constは再代入不可の変数宣言です。',
      'letは再代入可能でconstは不可',
      'true',
      '1',
      'es6|variables',
    ],
    [
      'javascript',
      'js-var-let',
      'letとconstの違いは何ですか？',
      'letは再代入可能、constは再代入不可の変数宣言です。',
      'どちらも再代入可能',
      'false',
      '2',
      'es6|variables',
    ],
    [
      'javascript',
      'js-var-let',
      'letとconstの違いは何ですか？',
      'letは再代入可能、constは再代入不可の変数宣言です。',
      'どちらも再代入不可',
      'false',
      '3',
      'es6|variables',
    ],
    [
      'javascript',
      'js-var-let',
      'letとconstの違いは何ですか？',
      'letは再代入可能、constは再代入不可の変数宣言です。',
      'letはグローバルスコープのみ',
      'false',
      '4',
      'es6|variables',
    ],
    [
      'javascript',
      'js-arrow-fn',
      'アロー関数の特徴として正しいものは？',
      'アロー関数は自身のthisを持たず、外側のスコープのthisを参照します。',
      '自身のthisを持たない',
      'true',
      '1',
      'es6|functions',
    ],
    [
      'javascript',
      'js-arrow-fn',
      'アロー関数の特徴として正しいものは？',
      'アロー関数は自身のthisを持たず、外側のスコープのthisを参照します。',
      'argumentsオブジェクトを持つ',
      'false',
      '2',
      'es6|functions',
    ],
    [
      'javascript',
      'js-arrow-fn',
      'アロー関数の特徴として正しいものは？',
      'アロー関数は自身のthisを持たず、外側のスコープのthisを参照します。',
      'コンストラクタとして使用できる',
      'false',
      '3',
      'es6|functions',
    ],
  ])}`;
}

async function fetchExportFromExpress(
  categoryId: number | null,
  authorization: string | null,
): Promise<QuizCsvExportResult> {
  const searchParams = new URLSearchParams();
  if (categoryId != null) {
    searchParams.set('category_id', String(categoryId));
  }
  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/api/quiz/csv/export${suffix}`, {
    cache: 'no-store',
    headers: authorization ? { authorization } : undefined,
  });

  if (!res.ok) {
    throw new Error(`Express quiz CSV export fallback failed: ${res.status}`);
  }

  return {
    csv: await res.text(),
    filename: `quizzes_${Date.now()}.csv`,
    source: 'express-fallback',
  };
}

async function requestImportFromExpress(
  csv: string,
  authorization: string | null,
): Promise<QuizCsvImportResult> {
  const res = await fetch(`${API_BASE_URL}/api/quiz/csv/import`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { authorization } : {}),
    },
    body: JSON.stringify({ csv }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Express quiz CSV import fallback failed: ${res.status}`);
  }

  return {
    body,
    source: 'express-fallback',
  };
}

async function exportCsvFromDb(categoryId: number | null): Promise<QuizCsvExportResult> {
  const params: unknown[] = [];
  const categoryWhere = categoryId != null ? 'AND q.category_id = ?' : '';
  if (categoryId != null) {
    params.push(categoryId);
  }

  const [rows] = await getMysqlPool().query<ExportRow[]>(
    `
      SELECT
        q.id AS quiz_id,
        c.slug AS category_slug,
        q.slug AS quiz_slug,
        q.question,
        q.explanation,
        choice.choice_text,
        choice.is_correct,
        choice.display_order AS choice_order
      FROM quiz q
      INNER JOIN quiz_category c ON c.id = q.category_id AND c.deleted_at IS NULL
      LEFT JOIN quiz_choice choice ON choice.quiz_id = q.id
      WHERE q.deleted_at IS NULL
        ${categoryWhere}
      ORDER BY q.id ASC, COALESCE(choice.display_order, 0) ASC, choice.id ASC
    `,
    params,
  );

  const quizIds = Array.from(new Set(rows.map((row) => Number(row.quiz_id))));
  const tagsByQuizId = new Map<number, string[]>();

  if (quizIds.length > 0) {
    const [tagRows] = await getMysqlPool().query<QuizTagSlugRow[]>(
      `
        SELECT
          tagging.quiz_id,
          tag.slug AS tag_slug
        FROM quiz_tagging tagging
        INNER JOIN quiz_tag tag ON tag.id = tagging.quiz_tag_id
        WHERE tagging.quiz_id IN (?)
        ORDER BY tag.slug ASC
      `,
      [quizIds],
    );

    for (const tagRow of tagRows) {
      const quizId = Number(tagRow.quiz_id);
      const tags = tagsByQuizId.get(quizId) ?? [];
      tags.push(tagRow.tag_slug);
      tagsByQuizId.set(quizId, tags);
    }
  }

  const csvRows: string[][] = [CSV_HEADERS as unknown as string[]];
  for (const row of rows) {
    csvRows.push([
      row.category_slug,
      row.quiz_slug,
      row.question,
      row.explanation ?? '',
      row.choice_text ?? '',
      row.is_correct == null ? '' : Number(row.is_correct) === 1 ? 'true' : 'false',
      row.choice_order == null ? '' : String(row.choice_order),
      (tagsByQuizId.get(Number(row.quiz_id)) ?? []).join('|'),
    ]);
  }

  return {
    csv: `\uFEFF${toCsvString(csvRows)}`,
    filename: `quizzes_${Date.now()}.csv`,
    source: 'db',
  };
}

function parseCategoryId(categoryIdInput: string | null): number | null {
  if (!categoryIdInput) return null;

  const categoryId = Number(categoryIdInput);
  if (!Number.isFinite(categoryId)) {
    throw new QuizCsvParamsError('Invalid category_id');
  }

  return categoryId;
}

async function getCategoriesBySlug(connection: PoolConnection): Promise<Map<string, number>> {
  const [rows] = await connection.query<CategoryRow[]>(
    `
      SELECT id, slug
      FROM quiz_category
      WHERE deleted_at IS NULL
    `,
  );

  return new Map(rows.map((row) => [row.slug, Number(row.id)]));
}

async function getTagsBySlug(connection: PoolConnection): Promise<Map<string, number>> {
  const [rows] = await connection.query<TagRow[]>(
    `
      SELECT id, slug
      FROM quiz_tag
    `,
  );

  return new Map(rows.map((row) => [row.slug, Number(row.id)]));
}

async function findQuizIdBySlug(connection: PoolConnection, slug: string): Promise<number | null> {
  const [rows] = await connection.query<QuizRow[]>(
    `
      SELECT id
      FROM quiz
      WHERE slug = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [slug],
  );

  return rows[0] ? Number(rows[0].id) : null;
}

async function importCsvToDb(userId: number, rawCsv: string): Promise<QuizCsvImportResult> {
  if (!rawCsv) {
    throw new QuizCsvParamsError('CSV data is required');
  }

  const csvContent = rawCsv.charCodeAt(0) === 0xfeff ? rawCsv.slice(1) : rawCsv;
  const records = parseCsv(csvContent);
  if (records.length === 0) {
    throw new QuizCsvParamsError('CSV file is empty');
  }

  const quizGroups = new Map<string, { row: CsvRow; choices: CsvRow[] }>();
  for (const row of records) {
    if (!row.quiz_slug || !row.category_slug || !row.question) {
      continue;
    }

    const existing = quizGroups.get(row.quiz_slug);
    if (existing) {
      if (row.choice_text) {
        existing.choices.push(row);
      }
    } else {
      quizGroups.set(row.quiz_slug, {
        row,
        choices: row.choice_text ? [row] : [],
      });
    }
  }

  if (quizGroups.size === 0) {
    throw new QuizCsvParamsError('No valid quiz data found in CSV');
  }

  const connection = await getMysqlPool().getConnection();
  const created: string[] = [];
  const updated: string[] = [];
  const errors: string[] = [];
  const createdTags: string[] = [];

  try {
    const categoryBySlug = await getCategoriesBySlug(connection);
    const tagBySlug = await getTagsBySlug(connection);

    for (const [slug, group] of quizGroups) {
      const { row, choices } = group;
      const categoryId = categoryBySlug.get(row.category_slug);

      if (!categoryId) {
        errors.push(`${slug}: カテゴリー "${row.category_slug}" が見つかりません`);
        continue;
      }

      if (choices.length === 0) {
        errors.push(`${slug}: 選択肢がありません`);
        continue;
      }

      try {
        await connection.beginTransaction();

        let quizId = await findQuizIdBySlug(connection, slug);
        const isUpdate = quizId != null;

        if (quizId != null) {
          await connection.query(
            `
              UPDATE quiz
              SET
                category_id = ?,
                question = ?,
                explanation = ?
              WHERE id = ?
                AND deleted_at IS NULL
            `,
            [categoryId, row.question, row.explanation || '', quizId],
          );

          await connection.query('DELETE FROM quiz_choice WHERE quiz_id = ?', [quizId]);
          await connection.query('DELETE FROM quiz_tagging WHERE quiz_id = ?', [quizId]);
        } else {
          const [result] = await connection.query<ResultSetHeader>(
            `
              INSERT INTO quiz
                (slug, category_id, author_id, question, explanation)
              VALUES (?, ?, ?, ?, ?)
            `,
            [slug, categoryId, userId, row.question, row.explanation || null],
          );
          quizId = Number(result.insertId);
        }

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
              choice.is_correct?.toLowerCase() === 'true' ? 1 : 0,
              choice.choice_order ? Number(choice.choice_order) : i + 1,
            ],
          );
        }

        const tagSlugs = row.tags
          ? row.tags
              .split('|')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [];

        for (const tagSlug of tagSlugs) {
          let tagId = tagBySlug.get(tagSlug);
          if (!tagId) {
            const [result] = await connection.query<ResultSetHeader>(
              `
                INSERT INTO quiz_tag
                  (slug, name)
                VALUES (?, ?)
              `,
              [tagSlug, tagSlug],
            );
            tagId = Number(result.insertId);
            tagBySlug.set(tagSlug, tagId);
            createdTags.push(tagSlug);
          }

          await connection.query(
            `
              INSERT INTO quiz_tagging
                (quiz_id, quiz_tag_id)
              VALUES (?, ?)
            `,
            [quizId, tagId],
          );
        }

        await connection.commit();

        if (isUpdate) {
          updated.push(slug);
        } else {
          created.push(slug);
        }
      } catch (error) {
        await connection.rollback();
        console.error(`Failed to import quiz from CSV: ${slug}`, error);
        errors.push(`${slug}: インポートに失敗しました`);
      }
    }

    return {
      body: {
        message: 'インポート完了',
        created_count: created.length,
        updated_count: updated.length,
        error_count: errors.length,
        created_tags_count: createdTags.length,
        created,
        updated,
        errors,
        created_tags: createdTags,
      },
      source: 'db',
    };
  } finally {
    connection.release();
  }
}

export async function exportQuizCsv(
  categoryIdInput: string | null,
  authorization: string | null,
): Promise<QuizCsvExportResult> {
  const categoryId = parseCategoryId(categoryIdInput);

  try {
    return await exportCsvFromDb(categoryId);
  } catch (error) {
    if (error instanceof QuizCsvParamsError) {
      throw error;
    }

    console.error('Failed to export quiz CSV from DB. Falling back to Express.', error);
    return fetchExportFromExpress(categoryId, authorization);
  }
}

export async function importQuizCsv(
  userId: number,
  csv: string,
  authorization: string | null,
): Promise<QuizCsvImportResult> {
  try {
    return await importCsvToDb(userId, csv);
  } catch (error) {
    if (error instanceof QuizCsvParamsError) {
      throw error;
    }

    console.error('Failed to import quiz CSV to DB. Falling back to Express.', error);
    return requestImportFromExpress(csv, authorization);
  }
}

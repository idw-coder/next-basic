import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { getMysqlPool } from '@/lib/server/mysql';

interface UserRow extends RowDataPacket {
  id: number | string;
  name: string;
  email: string;
  googleId: string | null;
  emailVerified: number | boolean;
  stripeCustomerId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  role: string | null;
}

interface IdRow extends RowDataPacket {
  id: number | string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  googleId?: string;
  emailVerified: boolean;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
  role: string;
}

export interface UsersListResult {
  users: AdminUser[];
  source: 'db';
}

export interface UserMutationResult {
  body: AdminUser | { message: string };
  status: 200;
  source: 'db';
}

export class UserParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserParamsError';
  }
}

export class UserConflictError extends Error {
  constructor() {
    super('Email already in use');
    this.name = 'UserConflictError';
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}

function parseUserId(userIdInput: string | number): number {
  const userId = Number(userIdInput);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new UserParamsError('Invalid user id');
  }

  return userId;
}

function toIsoString(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function mapUserRow(row: UserRow): AdminUser {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    ...(row.googleId ? { googleId: row.googleId } : {}),
    emailVerified: Boolean(Number(row.emailVerified)),
    ...(row.stripeCustomerId ? { stripeCustomerId: row.stripeCustomerId } : {}),
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
    role: row.role || 'user',
  };
}

async function getUsersFromDb(): Promise<AdminUser[]> {
  const [rows] = await getMysqlPool().query<UserRow[]>(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.googleId,
        u.emailVerified,
        u.stripeCustomerId,
        u.createdAt,
        u.updatedAt,
        role_meta.metaValue AS role
      FROM \`user\` u
      LEFT JOIN user_meta role_meta
        ON role_meta.userId = u.id
       AND role_meta.metaKey = 'role'
      WHERE u.deletedAt IS NULL
      ORDER BY u.id ASC
    `,
  );

  return rows.map(mapUserRow);
}

async function getUserFromDb(userId: number): Promise<AdminUser> {
  const [rows] = await getMysqlPool().query<UserRow[]>(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.googleId,
        u.emailVerified,
        u.stripeCustomerId,
        u.createdAt,
        u.updatedAt,
        role_meta.metaValue AS role
      FROM \`user\` u
      LEFT JOIN user_meta role_meta
        ON role_meta.userId = u.id
       AND role_meta.metaKey = 'role'
      WHERE u.id = ?
        AND u.deletedAt IS NULL
      LIMIT 1
    `,
    [userId],
  );

  const user = rows[0];
  if (!user) {
    throw new UserNotFoundError();
  }

  return mapUserRow(user);
}

function normalizeUserPayload(payload: unknown): {
  name?: string;
  email?: string;
  role?: string;
} {
  const body = payload as { name?: unknown; email?: unknown; role?: unknown };

  return {
    ...(typeof body.name === 'string' ? { name: body.name.trim() } : {}),
    ...(typeof body.email === 'string' ? { email: body.email.trim() } : {}),
    ...(typeof body.role === 'string' ? { role: body.role } : {}),
  };
}

async function updateUserInDb(
  userId: number,
  payload: unknown,
): Promise<UserMutationResult> {
  await getUserFromDb(userId);
  const user = normalizeUserPayload(payload);

  if (user.email) {
    const [rows] = await getMysqlPool().query<IdRow[]>(
      `
        SELECT id
        FROM \`user\`
        WHERE email = ?
          AND deletedAt IS NULL
          AND id <> ?
        LIMIT 1
      `,
      [user.email, userId],
    );

    if (rows.length > 0) {
      throw new UserConflictError();
    }
  }

  await getMysqlPool().query(
    `
      UPDATE \`user\`
      SET
        name = COALESCE(?, name),
        email = COALESCE(?, email)
      WHERE id = ?
        AND deletedAt IS NULL
    `,
    [user.name || null, user.email || null, userId],
  );

  if (user.role) {
    await getMysqlPool().query(
      `
        INSERT INTO user_meta
          (userId, metaKey, metaValue, createdAt, updatedAt)
        VALUES (?, 'role', ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          metaValue = VALUES(metaValue),
          updatedAt = NOW()
      `,
      [userId, user.role],
    );
  }

  return {
    body: await getUserFromDb(userId),
    status: 200,
    source: 'db',
  };
}

async function deleteUserFromDb(userId: number, currentUserId: number): Promise<UserMutationResult> {
  if (userId === currentUserId) {
    throw new UserParamsError('自分自身は削除できません');
  }

  await getUserFromDb(userId);

  const [result] = await getMysqlPool().query<ResultSetHeader>(
    `
      DELETE FROM \`user\`
      WHERE id = ?
    `,
    [userId],
  );

  if (result.affectedRows === 0) {
    throw new UserNotFoundError();
  }

  return {
    body: { message: 'User deleted' },
    status: 200,
    source: 'db',
  };
}

export async function getAdminUsers(): Promise<UsersListResult> {
  return {
    users: await getUsersFromDb(),
    source: 'db',
  };
}

export async function updateAdminUser(
  userIdInput: string | number,
  payload: unknown,
): Promise<UserMutationResult> {
  const userId = parseUserId(userIdInput);

  try {
    return await updateUserInDb(userId, payload);
  } catch (error) {
    if (
      error instanceof UserParamsError ||
      error instanceof UserConflictError ||
      error instanceof UserNotFoundError
    ) {
      throw error;
    }

    console.error('Failed to update user in DB.', error);
    throw error;
  }
}

export async function deleteAdminUser(
  userIdInput: string | number,
  currentUserId: number,
): Promise<UserMutationResult> {
  const userId = parseUserId(userIdInput);

  try {
    return await deleteUserFromDb(userId, currentUserId);
  } catch (error) {
    if (error instanceof UserParamsError || error instanceof UserNotFoundError) {
      throw error;
    }

    console.error('Failed to delete user in DB.', error);
    throw error;
  }
}

import bcrypt from 'bcryptjs';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { getMysqlPool } from '@/lib/server/mysql';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8888';

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
  source: 'db' | 'express-fallback' | 'unavailable';
}

export interface UserMutationResult {
  body: AdminUser | { message: string };
  status: 200;
  source: 'db' | 'express-fallback';
}

export interface RegisterUserResult {
  body: {
    user: Omit<AdminUser, 'role'>;
    role: 'user';
    emailVerified: false;
  };
  status: 201;
  source: 'db' | 'express-fallback';
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

function isDuplicateEntryError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ER_DUP_ENTRY'
  );
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

async function fetchUsersFromExpress(authorization: string | null): Promise<AdminUser[]> {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    cache: 'no-store',
    headers: authorization ? { authorization } : undefined,
  });

  if (!res.ok) {
    throw new Error(`Express users fallback failed: ${res.status}`);
  }

  const body = (await res.json()) as { users: AdminUser[] };
  return body.users;
}

async function registerUserFromExpress(payload: unknown): Promise<RegisterUserResult> {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Express user registration fallback failed: ${res.status}`);
  }

  return {
    body,
    status: 201,
    source: 'express-fallback',
  };
}

async function requestUserMutationFromExpress(
  path: string,
  method: 'PATCH' | 'DELETE',
  payload: unknown,
  authorization: string | null,
): Promise<UserMutationResult> {
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
    throw new Error(`Express user mutation fallback failed: ${res.status}`);
  }

  return {
    body,
    status: 200,
    source: 'express-fallback',
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

function normalizeRegisterPayload(payload: unknown): {
  name?: string;
  email?: string;
  password?: string;
} {
  const body = payload as { name?: unknown; email?: unknown; password?: unknown };

  return {
    ...(typeof body.name === 'string' ? { name: body.name.trim() } : {}),
    ...(typeof body.email === 'string' ? { email: body.email.trim() } : {}),
    ...(typeof body.password === 'string' ? { password: body.password } : {}),
  };
}

async function createUserInDb(payload: unknown): Promise<RegisterUserResult> {
  const user = normalizeRegisterPayload(payload);

  if (!user.name || !user.email || !user.password) {
    throw new UserParamsError('Name, email, and password are required');
  }

  const [existingRows] = await getMysqlPool().query<IdRow[]>(
    `
      SELECT id
      FROM \`user\`
      WHERE email = ?
      LIMIT 1
    `,
    [user.email],
  );

  if (existingRows.length > 0) {
    throw new UserConflictError();
  }

  const hashedPassword = await bcrypt.hash(user.password, 10);
  const connection = await getMysqlPool().getConnection();

  try {
    await connection.beginTransaction();

    const [insertResult] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO \`user\`
          (name, email, password, emailVerified, createdAt, updatedAt)
        VALUES (?, ?, ?, FALSE, NOW(), NOW())
      `,
      [user.name, user.email, hashedPassword],
    );

    const userId = Number(insertResult.insertId);

    await connection.query(
      `
        INSERT INTO user_meta
          (userId, metaKey, metaValue, createdAt, updatedAt)
        VALUES (?, 'role', 'user', NOW(), NOW())
      `,
      [userId],
    );

    await connection.commit();

    const createdUser = await getUserFromDb(userId);

    return {
      body: {
        user: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          ...(createdUser.googleId ? { googleId: createdUser.googleId } : {}),
          emailVerified: createdUser.emailVerified,
          ...(createdUser.stripeCustomerId
            ? { stripeCustomerId: createdUser.stripeCustomerId }
            : {}),
          createdAt: createdUser.createdAt,
          updatedAt: createdUser.updatedAt,
        },
        role: 'user',
        emailVerified: false,
      },
      status: 201,
      source: 'db',
    };
  } catch (error) {
    await connection.rollback();

    if (isDuplicateEntryError(error)) {
      throw new UserConflictError();
    }

    throw error;
  } finally {
    connection.release();
  }
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

export async function registerUser(payload: unknown): Promise<RegisterUserResult> {
  try {
    return await createUserInDb(payload);
  } catch (error) {
    if (error instanceof UserParamsError || error instanceof UserConflictError) {
      throw error;
    }

    console.error('Failed to register user in DB. Falling back to Express.', error);
    return registerUserFromExpress(payload);
  }
}

export async function getAdminUsers(authorization: string | null): Promise<UsersListResult> {
  try {
    return {
      users: await getUsersFromDb(),
      source: 'db',
    };
  } catch (error) {
    console.error('Failed to fetch users from DB. Falling back to Express.', error);

    try {
      return {
        users: await fetchUsersFromExpress(authorization),
        source: 'express-fallback',
      };
    } catch (fallbackError) {
      console.error('Failed to fetch users from Express fallback.', fallbackError);

      return {
        users: [],
        source: 'unavailable',
      };
    }
  }
}

export async function updateAdminUser(
  userIdInput: string | number,
  payload: unknown,
  authorization: string | null,
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

    console.error('Failed to update user in DB. Falling back to Express.', error);
    return requestUserMutationFromExpress(`/api/users/${userId}`, 'PATCH', payload, authorization);
  }
}

export async function deleteAdminUser(
  userIdInput: string | number,
  currentUserId: number,
  authorization: string | null,
): Promise<UserMutationResult> {
  const userId = parseUserId(userIdInput);

  try {
    return await deleteUserFromDb(userId, currentUserId);
  } catch (error) {
    if (error instanceof UserParamsError || error instanceof UserNotFoundError) {
      throw error;
    }

    console.error('Failed to delete user in DB. Falling back to Express.', error);
    return requestUserMutationFromExpress(
      `/api/users/${userId}`,
      'DELETE',
      undefined,
      authorization,
    );
  }
}

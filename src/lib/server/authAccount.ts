import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { getMysqlPool } from '@/lib/server/mysql';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8888';

interface AuthUserRow extends RowDataPacket {
  id: number | string;
  name: string;
  email: string;
  password: string | null;
  googleId: string | null;
  emailVerified: number | boolean;
  stripeCustomerId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
  role: string | null;
}

interface IdRow extends RowDataPacket {
  id: number | string;
}

interface GoogleProfile {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  googleId?: string;
  emailVerified: boolean;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface LoginResult {
  body: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
  status: 200;
  source: 'db' | 'express-fallback';
}

export interface MeResult {
  body: {
    user: AccountUser;
    role?: string;
  };
  status: 200;
  source: 'db' | 'express-fallback';
}

export class AuthAccountError extends Error {
  status: 400 | 401 | 404 | 409;

  constructor(message: string, status: 400 | 401 | 404 | 409) {
    super(message);
    this.name = 'AuthAccountError';
    this.status = status;
  }
}

export class GoogleAuthError extends Error {
  constructor(message = 'Google login failed') {
    super(message);
    this.name = 'GoogleAuthError';
  }
}

function toIsoString(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function mapAccountUser(row: AuthUserRow): AccountUser {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    ...(row.googleId ? { googleId: row.googleId } : {}),
    emailVerified: Boolean(Number(row.emailVerified)),
    ...(row.stripeCustomerId ? { stripeCustomerId: row.stripeCustomerId } : {}),
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
    ...(row.deletedAt ? { deletedAt: toIsoString(row.deletedAt) } : {}),
  };
}

function signToken(user: AuthUserRow, role: string): string {
  return jwt.sign(
    { userId: String(user.id), email: user.email, role },
    process.env.JWT_SECRET || 'your-super-secret-key',
    { expiresIn: '7d' },
  );
}

function getFrontendUrl(request: Request): string {
  return process.env.FRONTEND_URL || new URL(request.url).origin;
}

function getGoogleCallbackUrl(request: Request): string {
  const configuredCallbackUrl =
    process.env.NEXT_GOOGLE_CALLBACK_URL || process.env.GOOGLE_CALLBACK_URL;

  if (configuredCallbackUrl?.includes('/next-api/auth/google/callback')) {
    return configuredCallbackUrl;
  }

  if (configuredCallbackUrl?.includes('/api/auth/google/callback')) {
    return configuredCallbackUrl.replace(
      '/api/auth/google/callback',
      '/next-api/auth/google/callback',
    );
  }

  return new URL('/next-api/auth/google/callback', request.url).toString();
}

function getGoogleOAuthConfig(request: Request): {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
} {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new GoogleAuthError('Google OAuth environment variables are not configured');
  }

  return {
    clientId,
    clientSecret,
    callbackUrl: getGoogleCallbackUrl(request),
  };
}

export function createGoogleAuthorization(request: Request): {
  url: string;
  state: string;
} {
  const { clientId, callbackUrl } = getGoogleOAuthConfig(request);
  const state = randomUUID();
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');

  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', callbackUrl);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'email profile');
  url.searchParams.set('state', state);

  return {
    url: url.toString(),
    state,
  };
}

async function exchangeGoogleCodeForAccessToken(
  request: Request,
  code: string,
): Promise<string> {
  const { clientId, clientSecret, callbackUrl } = getGoogleOAuthConfig(request);
  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: callbackUrl,
    grant_type: 'authorization_code',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const body = (await res.json()) as { access_token?: string };
  if (!res.ok || !body.access_token) {
    throw new GoogleAuthError();
  }

  return body.access_token;
}

async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const profile = (await res.json()) as GoogleProfile;
  if (!res.ok || !profile.sub || !profile.email) {
    throw new GoogleAuthError();
  }

  return profile;
}

async function findOrCreateGoogleUser(profile: GoogleProfile): Promise<AuthUserRow> {
  const email = profile.email;
  if (!email) {
    throw new GoogleAuthError('Google account does not have an email address');
  }

  const connection = await getMysqlPool().getConnection();

  try {
    await connection.beginTransaction();

    const [googleRows] = await connection.query<AuthUserRow[]>(
      `
        SELECT
          u.id,
          u.name,
          u.email,
          u.password,
          u.googleId,
          u.emailVerified,
          u.stripeCustomerId,
          u.createdAt,
          u.updatedAt,
          u.deletedAt,
          role_meta.metaValue AS role
        FROM \`user\` u
        LEFT JOIN user_meta role_meta
          ON role_meta.userId = u.id
         AND role_meta.metaKey = 'role'
        WHERE u.googleId = ?
          AND u.deletedAt IS NULL
        LIMIT 1
      `,
      [profile.sub],
    );

    let user = googleRows[0];

    if (!user) {
      const [emailRows] = await connection.query<AuthUserRow[]>(
        `
          SELECT
            u.id,
            u.name,
            u.email,
            u.password,
            u.googleId,
            u.emailVerified,
            u.stripeCustomerId,
            u.createdAt,
            u.updatedAt,
            u.deletedAt,
            role_meta.metaValue AS role
          FROM \`user\` u
          LEFT JOIN user_meta role_meta
            ON role_meta.userId = u.id
           AND role_meta.metaKey = 'role'
          WHERE u.email = ?
            AND u.deletedAt IS NULL
          LIMIT 1
        `,
        [email],
      );

      user = emailRows[0];
    }

    if (!user) {
      const [insertResult] = await connection.query<ResultSetHeader>(
        `
          INSERT INTO \`user\`
            (name, email, password, googleId, emailVerified, createdAt, updatedAt)
          VALUES (?, ?, NULL, ?, TRUE, NOW(), NOW())
        `,
        [profile.name || email, email, profile.sub],
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
    } else if (!user.googleId) {
      await connection.query(
        `
          UPDATE \`user\`
          SET googleId = ?,
              emailVerified = TRUE,
              updatedAt = NOW()
          WHERE id = ?
            AND deletedAt IS NULL
        `,
        [profile.sub, user.id],
      );
    }

    await connection.commit();

    return getAuthUserByGoogleId(profile.sub);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getAuthUserByGoogleId(googleId: string): Promise<AuthUserRow> {
  const [rows] = await getMysqlPool().query<AuthUserRow[]>(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.password,
        u.googleId,
        u.emailVerified,
        u.stripeCustomerId,
        u.createdAt,
        u.updatedAt,
        u.deletedAt,
        role_meta.metaValue AS role
      FROM \`user\` u
      LEFT JOIN user_meta role_meta
        ON role_meta.userId = u.id
       AND role_meta.metaKey = 'role'
      WHERE u.googleId = ?
        AND u.deletedAt IS NULL
      LIMIT 1
    `,
    [googleId],
  );

  const user = rows[0];
  if (!user) {
    throw new GoogleAuthError();
  }

  return user;
}

export function getGoogleFailureRedirect(request: Request): URL {
  return new URL('/login?error=google', getFrontendUrl(request));
}

export async function handleGoogleCallback(
  request: Request,
  code: string,
): Promise<URL> {
  const accessToken = await exchangeGoogleCodeForAccessToken(request, code);
  const profile = await fetchGoogleProfile(accessToken);
  const user = await findOrCreateGoogleUser(profile);
  const token = signToken(user, user.role || 'user');
  const redirectUrl = new URL('/auth/callback', getFrontendUrl(request));

  redirectUrl.searchParams.set('token', token);

  return redirectUrl;
}

async function getAuthUserFromDb(userId: number | string): Promise<AuthUserRow> {
  const [rows] = await getMysqlPool().query<AuthUserRow[]>(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.password,
        u.googleId,
        u.emailVerified,
        u.stripeCustomerId,
        u.createdAt,
        u.updatedAt,
        u.deletedAt,
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
    throw new AuthAccountError('ユーザーが見つかりません', 404);
  }

  return user;
}

async function requestLoginFromExpress(payload: unknown): Promise<LoginResult> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Express login fallback failed: ${res.status}`);
  }

  return {
    body,
    status: 200,
    source: 'express-fallback',
  };
}

async function requestMeFromExpress(
  method: 'GET' | 'PATCH',
  authorization: string | null,
  payload?: unknown,
): Promise<MeResult> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method,
    cache: 'no-store',
    headers: {
      ...(payload !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(authorization ? { authorization } : {}),
    },
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Express me fallback failed: ${res.status}`);
  }

  return {
    body,
    status: 200,
    source: 'express-fallback',
  };
}

async function loginWithDb(payload: unknown): Promise<LoginResult> {
  const body = payload as { email?: unknown; password?: unknown };
  const email = typeof body.email === 'string' ? body.email : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    throw new AuthAccountError('メールアドレスとパスワードは必須です', 400);
  }

  const [rows] = await getMysqlPool().query<AuthUserRow[]>(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.password,
        u.googleId,
        u.emailVerified,
        u.stripeCustomerId,
        u.createdAt,
        u.updatedAt,
        u.deletedAt,
        role_meta.metaValue AS role
      FROM \`user\` u
      LEFT JOIN user_meta role_meta
        ON role_meta.userId = u.id
       AND role_meta.metaKey = 'role'
      WHERE u.email = ?
        AND u.deletedAt IS NULL
      LIMIT 1
    `,
    [email],
  );

  const user = rows[0];
  const invalidError = new AuthAccountError(
    'メールアドレスまたはパスワードが正しくありません',
    401,
  );

  if (!user?.password) {
    throw invalidError;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw invalidError;
  }

  const role = user.role || 'user';

  return {
    body: {
      token: signToken(user, role),
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role,
      },
    },
    status: 200,
    source: 'db',
  };
}

async function getMeFromDb(userId: number): Promise<MeResult> {
  const user = await getAuthUserFromDb(userId);

  return {
    body: {
      user: mapAccountUser(user),
      role: user.role || 'user',
    },
    status: 200,
    source: 'db',
  };
}

async function updateMeInDb(userId: number, payload: unknown): Promise<MeResult> {
  const body = payload as {
    name?: unknown;
    email?: unknown;
    currentPassword?: unknown;
    newPassword?: unknown;
  };
  const user = await getAuthUserFromDb(userId);
  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      throw new AuthAccountError('名前を入力してください', 400);
    }
    updates.push('name = ?');
    values.push(name);
  }

  if (body.email !== undefined) {
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    if (!email) {
      throw new AuthAccountError('メールアドレスを入力してください', 400);
    }

    const [existingRows] = await getMysqlPool().query<IdRow[]>(
      `
        SELECT id
        FROM \`user\`
        WHERE email = ?
          AND deletedAt IS NULL
          AND id <> ?
        LIMIT 1
      `,
      [email, userId],
    );

    if (existingRows.length > 0) {
      throw new AuthAccountError('このメールアドレスはすでに使用されています', 409);
    }

    updates.push('email = ?');
    values.push(email);
  }

  if (body.newPassword !== undefined) {
    const currentPassword =
      typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword) {
      throw new AuthAccountError('現在のパスワードを入力してください', 400);
    }

    const isValid = user.password
      ? await bcrypt.compare(currentPassword, user.password)
      : false;

    if (!isValid) {
      throw new AuthAccountError('現在のパスワードが正しくありません', 401);
    }

    if (newPassword.length < 6) {
      throw new AuthAccountError('新しいパスワードは6文字以上で入力してください', 400);
    }

    updates.push('password = ?');
    values.push(await bcrypt.hash(newPassword, 10));
  }

  if (updates.length > 0) {
    await getMysqlPool().query(
      `
        UPDATE \`user\`
        SET ${updates.join(', ')},
            updatedAt = NOW()
        WHERE id = ?
          AND deletedAt IS NULL
      `,
      [...values, userId],
    );
  }

  const updatedUser = await getAuthUserFromDb(userId);

  return {
    body: {
      user: mapAccountUser(updatedUser),
    },
    status: 200,
    source: 'db',
  };
}

export async function login(payload: unknown): Promise<LoginResult> {
  try {
    return await loginWithDb(payload);
  } catch (error) {
    if (error instanceof AuthAccountError) {
      throw error;
    }

    console.error('Failed to login with DB. Falling back to Express.', error);
    return requestLoginFromExpress(payload);
  }
}

export async function getMe(userId: number, authorization: string | null): Promise<MeResult> {
  try {
    return await getMeFromDb(userId);
  } catch (error) {
    if (error instanceof AuthAccountError) {
      throw error;
    }

    console.error('Failed to fetch current user from DB. Falling back to Express.', error);
    return requestMeFromExpress('GET', authorization);
  }
}

export async function updateMe(
  userId: number,
  authorization: string | null,
  payload: unknown,
): Promise<MeResult> {
  try {
    return await updateMeInDb(userId, payload);
  } catch (error) {
    if (error instanceof AuthAccountError) {
      throw error;
    }

    console.error('Failed to update current user in DB. Falling back to Express.', error);
    return requestMeFromExpress('PATCH', authorization, payload);
  }
}

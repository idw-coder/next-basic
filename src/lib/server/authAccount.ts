import { randomUUID } from 'crypto';
import { ConfidentialClientApplication, CryptoProvider } from '@azure/msal-node';
import { OAuth2Client } from 'google-auth-library';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { getMysqlPool } from '@/lib/server/mysql';
import { createSession } from '@/lib/server/session';

interface AuthUserRow extends RowDataPacket {
  id: number | string;
  name: string;
  email: string;
  googleId: string | null;
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
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface MeResult {
  body: {
    user: AccountUser;
    role?: string;
  };
  status: 200;
  source: 'db';
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

// ログイン画面に出し分けるための失敗理由。/login?error=microsoft_<reason> になる（failed は error=microsoft）
export type MicrosoftAuthFailureReason = 'failed' | 'no_email' | 'email_taken';

export class MicrosoftAuthError extends Error {
  reason: MicrosoftAuthFailureReason;

  constructor(message = 'Microsoft login failed', reason: MicrosoftAuthFailureReason = 'failed') {
    super(message);
    this.name = 'MicrosoftAuthError';
    this.reason = reason;
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
    ...(row.stripeCustomerId ? { stripeCustomerId: row.stripeCustomerId } : {}),
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
    ...(row.deletedAt ? { deletedAt: toIsoString(row.deletedAt) } : {}),
  };
}

function getFrontendUrl(request: Request): string {
  return process.env.FRONTEND_URL || new URL(request.url).origin;
}

function getGoogleCallbackUrl(request: Request): string {
  return (
    process.env.NEXT_GOOGLE_CALLBACK_URL ||
    new URL('/api/auth/google/callback', request.url).toString()
  );
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

function createGoogleOAuthClient(request: Request): { client: OAuth2Client; clientId: string } {
  const { clientId, clientSecret, callbackUrl } = getGoogleOAuthConfig(request);

  return {
    client: new OAuth2Client({ clientId, clientSecret, redirectUri: callbackUrl }),
    clientId,
  };
}

export function createGoogleAuthorization(request: Request): {
  url: string;
  state: string;
} {
  const { client } = createGoogleOAuthClient(request);
  const state = randomUUID();

  return {
    // openid を付けると、コード交換の応答に IDトークンが入る（fetchGoogleProfile で検証して使う）
    url: client.generateAuthUrl({ scope: ['openid', 'email', 'profile'], state }),
    state,
  };
}

/**
 * 認可コードをトークンに交換し、IDトークンを検証してプロフィールを取り出す。
 * IDトークンは Google の署名・発行者・宛先（audience = 自分の clientId）・期限をライブラリが検証する。
 * 以前は access_token で userinfo API をもう一度呼んでいたが、IDトークンに同じ項目が入っているため不要。
 */
async function fetchGoogleProfile(request: Request, code: string): Promise<GoogleProfile> {
  const { client, clientId } = createGoogleOAuthClient(request);
  const { tokens } = await client.getToken(code);

  if (!tokens.id_token) {
    throw new GoogleAuthError();
  }

  const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: clientId });
  const profile = ticket.getPayload();
  if (!profile?.sub || !profile.email) {
    throw new GoogleAuthError();
  }

  // メールアドレスが確認済み（email_verified: true）のGoogleアカウントしか受け付けない。
  //
  // findOrCreateGoogleUser は、Googleの sub で見つからないとき、同じメールアドレスの既存ユーザーに紐付ける。
  // Googleアカウントは Gmail 以外のアドレス（例: taro@example.com）でも作れ、作った時点では
  // そのアドレスの持ち主か確認されていないことがある（そのとき Google は email_verified: false を返す）。
  // この確認をしないと、他人のアドレスでGoogleアカウントを作るだけで、そのユーザー（管理者を含む）として
  // ログインできてしまう。未確認のまま新規作成させると、本人が後から登録したときに乗っ取られる。
  // Gmail のアドレスは常に確認済みなので、通常のユーザーには影響しない
  if (profile.email_verified !== true) {
    throw new GoogleAuthError('Google account email is not verified');
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
          u.googleId,
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
            u.googleId,
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
            (name, email, googleId, createdAt, updatedAt)
          VALUES (?, ?, ?, NOW(), NOW())
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
        u.googleId,
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
): Promise<{ redirectUrl: URL; sessionToken: string }> {
  const profile = await fetchGoogleProfile(request, code);
  const user = await findOrCreateGoogleUser(profile);
  const sessionToken = await createSession(user.id);
  // URL には何も載せない。ログイン状態は呼び出し側（コールバックのルート）がセットする session cookie で渡す
  const redirectUrl = new URL('/auth/callback', getFrontendUrl(request));

  return { redirectUrl, sessionToken };
}

// 個人の Microsoft アカウントと、組織（職場・学校）のアカウントの両方を受け付ける
const MICROSOFT_AUTHORITY = 'https://login.microsoftonline.com/common';
// email を付けないと、IDトークンに email クレームが入らない
const MICROSOFT_SCOPES = ['openid', 'profile', 'email'];
// 認可リクエストとコールバックのあいだで、state・nonce・PKCE の code_verifier を持ち回る cookie
export const MICROSOFT_OAUTH_COOKIE_NAME = 'microsoft_oauth';

interface MicrosoftProfile {
  homeAccountId: string;
  email: string;
  name?: string;
}

function getMicrosoftCallbackUrl(request: Request): string {
  return (
    process.env.NEXT_MICROSOFT_CALLBACK_URL ||
    new URL('/api/auth/microsoft/callback', request.url).toString()
  );
}

/**
 * MSAL のクライアントを作る。
 * トークンは保存しない（ログインした人を特定したら捨てる）ので、リクエストごとに作って捨てる。
 * 1つを使い回すと、ログインした全員分のトークンが MSAL のメモリキャッシュに溜まっていく。
 */
function createMicrosoftClient(): ConfidentialClientApplication {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new MicrosoftAuthError('Microsoft OAuth environment variables are not configured');
  }

  return new ConfidentialClientApplication({
    auth: { clientId, clientSecret, authority: MICROSOFT_AUTHORITY },
  });
}

export async function createMicrosoftAuthorization(request: Request): Promise<{
  url: string;
  oauthCookieValue: string;
}> {
  const client = createMicrosoftClient();
  const { verifier, challenge } = await new CryptoProvider().generatePkceCodes();
  const state = randomUUID();
  const nonce = randomUUID();

  const url = await client.getAuthCodeUrl({
    scopes: MICROSOFT_SCOPES,
    redirectUri: getMicrosoftCallbackUrl(request),
    state,
    nonce,
    codeChallenge: challenge,
    codeChallengeMethod: 'S256',
    // 複数の Microsoft アカウントを持つ人が、どれでログインするか選べるようにする
    prompt: 'select_account',
  });

  // state・nonce は UUID、verifier は base64url なので、どれも '.' を含まない
  return { url, oauthCookieValue: [state, nonce, verifier].join('.') };
}

/**
 * 認可コードをトークンに交換し、IDトークンからプロフィールを取り出す。
 *
 * IDトークンは MSAL が Microsoft のトークンエンドポイントから TLS で直接受け取ったもので、
 * MSAL は署名の検証はしない（OpenID Connect の仕様上、TLSで直接受け取ったIDトークンは署名検証を省ける）。
 * nonce は MSAL が照合する（不一致なら例外）。PKCE の code_verifier は Microsoft 側で照合される。
 */
async function fetchMicrosoftProfile(
  request: Request,
  code: string,
  nonce: string,
  codeVerifier: string,
): Promise<MicrosoftProfile> {
  const client = createMicrosoftClient();
  const result = await client.acquireTokenByCode({
    code,
    scopes: MICROSOFT_SCOPES,
    redirectUri: getMicrosoftCallbackUrl(request),
    nonce,
    codeVerifier,
  });

  // homeAccountId は `<oid>.<tid>`（ホームテナント基準）。oid はテナントごとに違う値なので、oid 単体ではキーにしない
  const homeAccountId = result.account?.homeAccountId;
  if (!homeAccountId) {
    throw new MicrosoftAuthError();
  }

  const claims = result.idTokenClaims as { email?: unknown; name?: unknown };
  const email = typeof claims.email === 'string' ? claims.email.trim() : '';
  // user.email は必須なので、メールアドレスのないアカウント（組織でメールボックスがない人など）は受け付けない
  if (!email) {
    throw new MicrosoftAuthError('Microsoft account does not have an email address', 'no_email');
  }

  return {
    homeAccountId,
    email,
    ...(typeof claims.name === 'string' && claims.name ? { name: claims.name } : {}),
  };
}

/**
 * microsoftId で既存ユーザーを探し、いなければ新規作成して、ユーザーIDを返す。
 *
 * Google と違い、メールアドレスで既存ユーザーに紐付けない。
 * Microsoft の email クレームは、組織のテナント管理者が自由に設定でき、持ち主の確認も保証されない。
 * 公式ドキュメントも「認可やユーザーの特定に使わない」としている
 * （https://learn.microsoft.com/en-us/entra/identity-platform/claims-validation）。
 * メールで紐付けると、他人のアドレスを設定した組織アカウントで、その人（管理者を含む）として
 * ログインできてしまう。
 *
 * user.email は UNIQUE なので、同じメールのユーザーがすでにいるときは新規作成もできない。
 * そのときはログインを断り、元の方法（Google）でログインしてもらう。
 * 削除済み（deletedAt あり）の行も UNIQUE にかかるため、メールの照合では deletedAt を見ない。
 */
async function findOrCreateMicrosoftUser(profile: MicrosoftProfile): Promise<number | string> {
  const connection = await getMysqlPool().getConnection();

  try {
    await connection.beginTransaction();

    const [microsoftRows] = await connection.query<IdRow[]>(
      `
        SELECT id
        FROM \`user\`
        WHERE microsoftId = ?
          AND deletedAt IS NULL
        LIMIT 1
      `,
      [profile.homeAccountId],
    );

    if (microsoftRows[0]) {
      await connection.commit();
      return microsoftRows[0].id;
    }

    const [emailRows] = await connection.query<IdRow[]>(
      `
        SELECT id
        FROM \`user\`
        WHERE email = ?
        LIMIT 1
      `,
      [profile.email],
    );

    if (emailRows[0]) {
      throw new MicrosoftAuthError(
        'Email address is already registered with another login method',
        'email_taken',
      );
    }

    const [insertResult] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO \`user\`
          (name, email, microsoftId, createdAt, updatedAt)
        VALUES (?, ?, ?, NOW(), NOW())
      `,
      [profile.name || profile.email, profile.email, profile.homeAccountId],
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

    return userId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export function getMicrosoftFailureRedirect(
  request: Request,
  reason: MicrosoftAuthFailureReason = 'failed',
): URL {
  const error = reason === 'failed' ? 'microsoft' : `microsoft_${reason}`;
  return new URL(`/login?error=${error}`, getFrontendUrl(request));
}

export async function handleMicrosoftCallback(
  request: Request,
  params: { code: string | null; state: string | null; oauthCookieValue: string | null },
): Promise<{ redirectUrl: URL; sessionToken: string }> {
  const [expectedState, nonce, codeVerifier] = params.oauthCookieValue?.split('.') ?? [];

  if (!params.code || !params.state || !expectedState || !nonce || !codeVerifier) {
    throw new MicrosoftAuthError();
  }
  if (params.state !== expectedState) {
    throw new MicrosoftAuthError();
  }

  const profile = await fetchMicrosoftProfile(request, params.code, nonce, codeVerifier);
  const userId = await findOrCreateMicrosoftUser(profile);
  const sessionToken = await createSession(userId);
  // Google と同じく、ログイン状態は呼び出し側がセットする session cookie で渡す
  const redirectUrl = new URL('/auth/callback', getFrontendUrl(request));

  return { redirectUrl, sessionToken };
}

async function getAuthUserFromDb(userId: number | string): Promise<AuthUserRow> {
  const [rows] = await getMysqlPool().query<AuthUserRow[]>(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.googleId,
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
  };
  // 存在しない・削除済みのユーザーなら 404 にする
  await getAuthUserFromDb(userId);
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

export async function getMe(userId: number): Promise<MeResult> {
  try {
    return await getMeFromDb(userId);
  } catch (error) {
    if (error instanceof AuthAccountError) {
      throw error;
    }

    console.error('Failed to fetch current user from DB.', error);
    throw error;
  }
}

export async function updateMe(
  userId: number,
  payload: unknown,
): Promise<MeResult> {
  try {
    return await updateMeInDb(userId, payload);
  } catch (error) {
    if (error instanceof AuthAccountError) {
      throw error;
    }

    console.error('Failed to update current user in DB.', error);
    throw error;
  }
}

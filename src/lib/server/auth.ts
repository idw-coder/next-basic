import jwt from 'jsonwebtoken';

const ROLE_ORDER: Record<string, number> = {
  user: 0,
  editor: 1,
  admin: 2,
};

export interface AuthUser {
  userId: number;
  email: string;
  role: string;
}

export class AuthError extends Error {
  status: 401 | 403;

  constructor(message: string, status: 401 | 403 = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

function getBearerToken(request: Request): string {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('認証トークンがありません');
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    throw new AuthError('認証トークンがありません');
  }

  return token;
}

export function verifyAuth(request: Request): AuthUser {
  try {
    const decoded = jwt.verify(
      getBearerToken(request),
      process.env.JWT_SECRET || 'your-super-secret-key',
    ) as Partial<AuthUser>;

    if (decoded.userId == null || typeof decoded.role !== 'string') {
      throw new AuthError('トークンが無効です');
    }

    return {
      userId: Number(decoded.userId),
      email: typeof decoded.email === 'string' ? decoded.email : '',
      role: decoded.role,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('トークンが無効です');
  }
}

export function requireRole(user: AuthUser, minRole: keyof typeof ROLE_ORDER): void {
  const userLevel = ROLE_ORDER[user.role] ?? -1;
  const minLevel = ROLE_ORDER[minRole] ?? -1;

  if (userLevel < minLevel) {
    throw new AuthError('Forbidden', 403);
  }
}

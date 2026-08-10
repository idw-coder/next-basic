import { NextResponse } from 'next/server';

import { AuthError, requireRole, verifyAuth } from '@/lib/server/auth';
import {
  UserConflictError,
  UserParamsError,
  getAdminUsers,
  registerUser,
} from '@/lib/server/users';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);
    requireRole(user, 'admin');

    const result = await getAdminUsers(request.headers.get('authorization'));

    return NextResponse.json(
      { users: result.users },
      {
        headers: result.source !== 'db' ? { 'x-next-api-fallback': result.source } : undefined,
      },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Failed to fetch users.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await registerUser(await request.json());

    return NextResponse.json(result.body, {
      status: result.status,
      headers: result.source !== 'db' ? { 'x-next-api-fallback': result.source } : undefined,
    });
  } catch (error) {
    if (error instanceof UserParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof UserConflictError) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    console.error('Failed to register user.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

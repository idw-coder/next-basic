import { NextResponse } from 'next/server';

import { AuthError, requireRole, verifyAuth } from '@/lib/server/auth';
import {
  UserConflictError,
  UserNotFoundError,
  UserParamsError,
  deleteAdminUser,
  updateAdminUser,
} from '@/lib/server/users';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  try {
    const user = verifyAuth(request);
    requireRole(user, 'admin');

    const result = await updateAdminUser(
      userId,
      await request.json(),
      request.headers.get('authorization'),
    );

    return NextResponse.json(result.body, {
      headers: result.source !== 'db' ? { 'x-next-api-fallback': result.source } : undefined,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof UserParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof UserConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to update user.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  try {
    const user = verifyAuth(request);
    requireRole(user, 'admin');

    const result = await deleteAdminUser(
      userId,
      user.userId,
      request.headers.get('authorization'),
    );

    return NextResponse.json(result.body, {
      headers: result.source !== 'db' ? { 'x-next-api-fallback': result.source } : undefined,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof UserParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to delete user.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

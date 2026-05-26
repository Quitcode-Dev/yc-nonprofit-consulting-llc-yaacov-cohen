import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, assertRole, assertOrgAccess } from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
    assertRole(profile, ['super_admin', 'org_admin']);
    assertOrgAccess(profile, id);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = (err as Error).message ?? 'Unauthorized';
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json([]);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
    assertRole(profile, ['super_admin', 'org_admin']);
    assertOrgAccess(profile, id);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = (err as Error).message ?? 'Unauthorized';
    return NextResponse.json({ error: message }, { status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'Body must be an array' }, { status: 400 });
  }

  return NextResponse.json([]);
}

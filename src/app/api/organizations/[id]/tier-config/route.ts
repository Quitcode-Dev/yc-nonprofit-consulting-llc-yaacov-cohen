import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id: orgId } = await context.params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];
  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (profile.role !== 'super_admin' && profile.organization_id !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ tiers: [] });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id: orgId } = await context.params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];
  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (profile.role !== 'super_admin' && profile.organization_id !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { tiers?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!Array.isArray(body.tiers)) {
    return NextResponse.json({ error: 'tiers must be an array' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

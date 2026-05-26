import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole } from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    const auth = await getAuthenticatedUser();
    assertRole(auth.profile, ['super_admin']);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = (err as Error).message ?? 'Unauthorized';
    return NextResponse.json({ error: message }, { status });
  }

  const supabase = await createClient();

  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  return NextResponse.json(org);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
    assertRole(profile, ['super_admin', 'org_admin']);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = (err as Error).message ?? 'Unauthorized';
    return NextResponse.json({ error: message }, { status });
  }

  if (profile.role === 'org_admin') {
    if (profile.organization_id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  let body: { name?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase = await createClient();

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || (body.name as string).trim() === '') {
      return NextResponse.json({ error: 'name must be a non-empty string' }, { status: 400 });
    }
    const trimmedName = (body.name as string).trim();
    updatePayload.name = trimmedName;
    updatePayload.slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  const { data: org, error } = await supabase
    .from('organizations')
    .update(updatePayload as never)
    .eq('id', id)
    .select()
    .single();

  if (error || !org) {
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
  }

  return NextResponse.json(org);
}

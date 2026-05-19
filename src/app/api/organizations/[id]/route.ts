import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole } from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  // Authenticate & authorise
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

  // Authenticate & authorise
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

  // org_admin can only edit their own organization
  if (profile.role === 'org_admin') {
    if (profile.organization_id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  let body: { is_active?: unknown; name?: unknown; contact_name?: unknown; contact_email?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase = await createClient();

  if (profile.role === 'org_admin') {
    // org_admin can only update name, contact_name, contact_email
    const { name, contact_name, contact_email } = body;

    if (name !== undefined && (typeof name !== 'string' || (name as string).trim() === '')) {
      return NextResponse.json({ error: 'name must be a non-empty string' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updatePayload.name = (name as string).trim();
    if (contact_name !== undefined) updatePayload.contact_name = contact_name || null;
    if (contact_email !== undefined) updatePayload.contact_email = contact_email || null;

    const { data: org, error } = await supabase
      .from('organizations')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !org) {
      return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
    }

    return NextResponse.json(org);
  }

  // super_admin path — original behaviour (is_active toggle)
  if (typeof body.is_active !== 'boolean') {
    return NextResponse.json(
      { error: 'is_active must be a boolean' },
      { status: 400 }
    );
  }

  const { data: org, error } = await supabase
    .from('organizations')
    .update({
      is_active: body.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !org) {
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }

  return NextResponse.json(org);
}

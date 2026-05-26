import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole, AuthorizationError } from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
    assertRole(profile, ['super_admin', 'org_admin']);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Accept 'name' or legacy 'title'
  const name = ((body.name ?? body.title) as string | undefined)?.trim();
  if (!name || name.length === 0) {
    return NextResponse.json({ error: 'name is required' }, { status: 422 });
  }
  if (name.length > 150) {
    return NextResponse.json({ error: 'name must be 150 characters or fewer' }, { status: 422 });
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from('move_ideas')
    .select('id, is_global, organization_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Move idea not found' }, { status: 404 });
  }

  if (profile.role === 'org_admin') {
    if (existing.is_global || existing.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const purposeRaw = body.purpose ?? body.category;
  const updatePayload: Record<string, unknown> = { name };
  if (purposeRaw !== undefined) {
    updatePayload.purpose = Array.isArray(purposeRaw) ? purposeRaw : [String(purposeRaw)];
  }
  if (body.methods !== undefined) {
    updatePayload.methods = Array.isArray(body.methods) ? body.methods : [];
  }
  if (body.types !== undefined) {
    updatePayload.types = Array.isArray(body.types) ? body.types : [];
  }

  const { data: moveIdea, error } = await supabase
    .from('move_ideas')
    .update(updatePayload as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating move idea:', error);
    return NextResponse.json({ error: 'Failed to update move idea' }, { status: 500 });
  }

  return NextResponse.json({ moveIdea });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
    assertRole(profile, ['super_admin', 'org_admin']);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from('move_ideas')
    .select('id, is_global, organization_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Move idea not found' }, { status: 404 });
  }

  if (profile.role === 'org_admin') {
    if (existing.is_global || existing.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { error } = await supabase.from('move_ideas').delete().eq('id', id);

  if (error) {
    console.error('Error deleting move idea:', error);
    return NextResponse.json({ error: 'Failed to delete move idea' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

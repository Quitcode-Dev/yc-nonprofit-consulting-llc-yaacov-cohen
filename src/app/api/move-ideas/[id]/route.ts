import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole, AuthorizationError } from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  // 1. Authenticate & authorise
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

  // 2. Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { title, category } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NextResponse.json({ error: 'title is required' }, { status: 422 });
  }
  if (title.trim().length > 150) {
    return NextResponse.json({ error: 'title must be 150 characters or fewer' }, { status: 422 });
  }
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return NextResponse.json({ error: 'category is required' }, { status: 422 });
  }

  const supabase = await createClient();

  // 3. Fetch the existing idea to verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('move_ideas')
    .select('id, is_global, organization_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Move idea not found' }, { status: 404 });
  }

  // Org admins can only edit their own org's ideas
  if (profile.role === 'org_admin') {
    if (existing.is_global || existing.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // 4. Update
  const { data: moveIdea, error } = await supabase
    .from('move_ideas')
    .update({ title: title.trim(), category: category.trim() })
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

  // 1. Authenticate & authorise
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

  // 2. Fetch the existing idea to verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('move_ideas')
    .select('id, is_global, organization_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Move idea not found' }, { status: 404 });
  }

  // Org admins can only delete their own org's ideas
  if (profile.role === 'org_admin') {
    if (existing.is_global || existing.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // 3. Hard delete — moves retain title as a snapshot on the move row itself
  const { error } = await supabase.from('move_ideas').delete().eq('id', id);

  if (error) {
    console.error('Error deleting move idea:', error);
    return NextResponse.json({ error: 'Failed to delete move idea' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

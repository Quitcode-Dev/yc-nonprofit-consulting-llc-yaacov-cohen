import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole, AuthorizationError } from '@/lib/auth/authorize';

export async function GET(request: NextRequest) {
  // 1. Authenticate & authorise
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
    assertRole(profile, ['super_admin', 'org_admin', 'solicitor']);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  // 2. Build query — global ideas always included; org-specific added when org exists
  const { searchParams } = new URL(request.url);
  const orgIdParam = searchParams.get('org_id');

  const organizationId =
    profile.role === 'super_admin' ? orgIdParam : profile.organization_id;

  let query = supabase
    .from('move_ideas')
    .select('id, title, category, organization_id, is_global, created_at')
    .order('title', { ascending: true });

  if (organizationId) {
    // Return global ideas OR ideas belonging to this org
    query = query.or(`is_global.eq.true,organization_id.eq.${organizationId}`);
  } else {
    // Super admin with no org filter — return only global ideas
    query = query.eq('is_global', true);
  }

  const { data: moveIdeas, error } = await query;

  if (error) {
    console.error('Error fetching move ideas:', error);
    return NextResponse.json({ error: 'Failed to fetch move ideas' }, { status: 500 });
  }

  return NextResponse.json({ moveIdeas: moveIdeas ?? [] });
}

export async function POST(request: NextRequest) {
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

  // 3. Determine is_global / organization_id based on role
  const isGlobal = profile.role === 'super_admin';
  const organizationId = profile.role === 'org_admin' ? profile.organization_id : null;

  if (profile.role === 'org_admin' && !organizationId) {
    return NextResponse.json(
      { error: 'No organization associated with this account' },
      { status: 400 }
    );
  }

  const { data: moveIdea, error } = await supabase
    .from('move_ideas')
    .insert({
      title: title.trim(),
      category: category.trim(),
      is_global: isGlobal,
      organization_id: organizationId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating move idea:', error);
    return NextResponse.json({ error: 'Failed to create move idea' }, { status: 500 });
  }

  return NextResponse.json({ moveIdea }, { status: 201 });
}

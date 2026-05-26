import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole, AuthorizationError } from '@/lib/auth/authorize';

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const orgIdParam = searchParams.get('org_id');

  const organizationId =
    profile.role === 'super_admin' ? orgIdParam : profile.organization_id;

  let query = supabase
    .from('move_ideas')
    .select('id, name, purpose, methods, types, organization_id, is_global, created_at')
    .order('name', { ascending: true });

  if (organizationId) {
    query = query.or(`is_global.eq.true,organization_id.eq.${organizationId}`);
  } else {
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

  // purpose: accept string or array
  const purposeRaw = body.purpose ?? body.category;
  const purpose: string[] = Array.isArray(purposeRaw)
    ? purposeRaw as string[]
    : purposeRaw
    ? [String(purposeRaw)]
    : [];

  const methods: string[] = Array.isArray(body.methods) ? body.methods as string[] : [];
  const types: string[] = Array.isArray(body.types) ? body.types as string[] : [];

  const supabase = await createClient();

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
      name,
      purpose,
      methods,
      types,
      is_global: isGlobal,
      organization_id: organizationId,
    } as never)
    .select()
    .single();

  if (error) {
    console.error('Error creating move idea:', error);
    return NextResponse.json({ error: 'Failed to create move idea' }, { status: 500 });
  }

  return NextResponse.json({ moveIdea }, { status: 201 });
}

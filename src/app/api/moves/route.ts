import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import {
  getAuthenticatedUser,
  assertRole,
  AuthorizationError,
} from '@/lib/auth/authorize';

export async function GET(request: NextRequest) {
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
    assertRole(profile, ['solicitor', 'org_admin', 'super_admin']);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const organizationId = profile.organization_id;

  // super_admin without org context is allowed — they see all data
  if (!organizationId && profile.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'No organization associated with this account' },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status') ?? 'all';
  const sortParam = searchParams.get('sort') ?? 'due_date_asc';
  const solicitorIdParam = searchParams.get('solicitor_id');
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  // Use the admin client for super_admin so RLS doesn't hide other orgs' rows.
  const supabase =
    profile.role === 'super_admin'
      ? createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        )
      : await createClient();

  let query = supabase
    .from('moves')
    .select(
      `id, name, due_date, is_completed, completion_notes, completed_at,
       donor_id, assigned_to, move_idea_id, organization_id,
       donors ( id, first_name, last_name )`
    );

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  if (profile.role === 'solicitor') {
    query = query.eq('assigned_to', profile.id);
  } else if (solicitorIdParam) {
    query = query.eq('assigned_to', solicitorIdParam);
  }

  if (statusFilter === 'pending') {
    query = query.eq('is_completed', false);
  } else if (statusFilter === 'completed') {
    query = query.eq('is_completed', true);
  }

  if (fromParam) {
    query = query.gte('due_date', fromParam);
  }
  if (toParam) {
    query = query.lte('due_date', toParam);
  }

  const ascending = sortParam !== 'due_date_desc';
  query = query.order('due_date', { ascending });

  const { data: moves, error } = await query;

  if (error) {
    console.error('Error fetching moves:', error);
    return NextResponse.json({ error: 'Failed to fetch moves' }, { status: 500 });
  }

  // Fetch solicitor (user_roles) names separately so we don't depend on FK joins.
  const solicitorIds = [
    ...new Set((moves ?? []).map((m) => m.assigned_to).filter(Boolean)),
  ];
  let solicitorMap: Record<string, { id: string; full_name: string | null }> = {};

  if (solicitorIds.length > 0) {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: solicitors } = await adminClient
      .from('user_roles')
      .select('id, full_name')
      .in('id', solicitorIds as string[]);
    solicitorMap = Object.fromEntries(
      (solicitors ?? []).map((s) => [s.id, s])
    );
  }

  const moveRows = (moves ?? []).map((m) => {
    const sol = m.assigned_to ? solicitorMap[m.assigned_to] : null;
    const parts = (sol?.full_name ?? '').split(' ');
    return {
      ...m,
      // Backwards-compat aliases for the UI
      title: m.name,
      status: m.is_completed ? 'completed' : 'pending',
      solicitor_id: m.assigned_to,
      profiles: sol
        ? { id: sol.id, first_name: parts[0] ?? '', last_name: parts.slice(1).join(' ') }
        : null,
    };
  });

  return NextResponse.json({ moves: moveRows });
}

export async function POST(request: NextRequest) {
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
    assertRole(profile, ['solicitor', 'org_admin', 'super_admin']);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const organizationId = profile.organization_id;
  if (!organizationId) {
    return NextResponse.json(
      { error: 'No organization associated with this account' },
      { status: 400 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { donor_id, move_idea_id, due_date } = body as {
    donor_id?: string;
    move_idea_id?: string;
    due_date?: string;
  };
  // Accept both 'name' and legacy 'title'
  const name = (body.name ?? body.title) as string | undefined;

  if (!donor_id || typeof donor_id !== 'string') {
    return NextResponse.json({ error: 'donor_id is required' }, { status: 422 });
  }
  if (!due_date || typeof due_date !== 'string') {
    return NextResponse.json({ error: 'due_date is required' }, { status: 422 });
  }
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'name is required' }, { status: 422 });
  }

  const dueDateObj = new Date(due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(dueDateObj.getTime()) || dueDateObj < today) {
    return NextResponse.json(
      { error: 'due_date must be today or a future date' },
      { status: 422 }
    );
  }

  const supabase = await createClient();

  const { data: donor, error: donorError } = await supabase
    .from('donors')
    .select('id, organization_id, primary_solicitor_id')
    .eq('id', donor_id)
    .eq('organization_id', organizationId)
    .single();

  if (donorError || !donor) {
    return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
  }

  if (profile.role === 'solicitor' && donor.primary_solicitor_id !== profile.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Allow caller to specify assigned_to; default to the current user's profile id
  const assignedTo = (body.assigned_to as string | null) || profile.id;

  const moveInsert = {
    organization_id: organizationId,
    donor_id,
    assigned_to: assignedTo,
    move_idea_id: move_idea_id || null,
    due_date,
    name: name.trim(),
    is_completed: false,
  };

  const { data: move, error: insertError } = await supabase
    .from('moves')
    .insert(moveInsert as never)
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting move:', insertError);
    return NextResponse.json({ error: 'Failed to create move' }, { status: 500 });
  }

  return NextResponse.json({ move }, { status: 201 });
}

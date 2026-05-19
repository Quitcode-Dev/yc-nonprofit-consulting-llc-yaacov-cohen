import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthenticatedUser,
  assertRole,
  AuthorizationError,
} from '@/lib/auth/authorize';

export async function GET(request: NextRequest) {
  // 1. Authenticate & authorise
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];
  let user: Awaited<ReturnType<typeof getAuthenticatedUser>>['user'];

  try {
    const auth = await getAuthenticatedUser(request);
    user = auth.user;
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

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status') ?? 'all';
  const sortParam = searchParams.get('sort') ?? 'due_date_asc';
  const solicitorIdParam = searchParams.get('solicitor_id');

  const supabase = await createClient();

  let query = supabase
    .from('moves')
    .select(
      `id, title, due_date, status, completion_notes, completed_at,
       donor_id, solicitor_id, move_idea_id, organization_id,
       donors ( id, first_name, last_name ),
       profiles:solicitor_id ( id, first_name, last_name )`
    )
    .eq('organization_id', organizationId);

  // Solicitors always see only their own moves
  if (profile.role === 'solicitor') {
    query = query.eq('solicitor_id', user.id);
  } else if (solicitorIdParam) {
    // Admins may optionally filter by solicitor
    query = query.eq('solicitor_id', solicitorIdParam);
  }

  if (statusFilter === 'pending') {
    query = query.eq('status', 'pending');
  } else if (statusFilter === 'completed') {
    query = query.eq('status', 'completed');
  }

  const ascending = sortParam !== 'due_date_desc';
  query = query.order('due_date', { ascending });

  const { data: moves, error } = await query;

  if (error) {
    console.error('Error fetching moves:', error);
    return NextResponse.json({ error: 'Failed to fetch moves' }, { status: 500 });
  }

  return NextResponse.json({ moves });
}

export async function POST(request: NextRequest) {
  // 1. Authenticate & authorise
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];
  let user: Awaited<ReturnType<typeof getAuthenticatedUser>>['user'];

  try {
    const auth = await getAuthenticatedUser();
    user = auth.user;
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

  // 2. Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { donor_id, move_idea_id, due_date, title } = body as {
    donor_id?: string;
    move_idea_id?: string;
    due_date?: string;
    title?: string;
  };

  // 3. Validate required fields
  if (!donor_id || typeof donor_id !== 'string') {
    return NextResponse.json({ error: 'donor_id is required' }, { status: 422 });
  }
  if (!due_date || typeof due_date !== 'string') {
    return NextResponse.json({ error: 'due_date is required' }, { status: 422 });
  }
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NextResponse.json({ error: 'title is required' }, { status: 422 });
  }

  // Validate due_date is today or future
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

  // 4. Validate donor belongs to org (and to solicitor if role === 'solicitor')
  const { data: donor, error: donorError } = await supabase
    .from('donors')
    .select('id, organization_id, assigned_solicitor_id')
    .eq('id', donor_id)
    .eq('organization_id', organizationId)
    .single();

  if (donorError || !donor) {
    return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
  }

  if (profile.role === 'solicitor' && donor.assigned_solicitor_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 5. Insert move
  const moveInsert = {
    organization_id: organizationId,
    donor_id,
    solicitor_id: user.id,
    move_idea_id: move_idea_id || null,
    due_date,
    title: title.trim(),
    status: 'pending' as const,
    completion_notes: null,
    completed_at: null,
    follow_up_move_id: null,
    parent_move_id: null,
  };

  const { data: move, error: insertError } = await supabase
    .from('moves')
    .insert(moveInsert)
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting move:', insertError);
    return NextResponse.json({ error: 'Failed to create move' }, { status: 500 });
  }

  return NextResponse.json({ move }, { status: 201 });
}

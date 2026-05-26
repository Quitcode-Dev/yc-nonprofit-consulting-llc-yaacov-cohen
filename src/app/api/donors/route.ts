import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getAuthenticatedUser, assertRole, AuthorizationError } from '@/lib/auth/authorize';

export async function GET(request: NextRequest) {
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
    assertRole(profile, ['org_admin', 'super_admin', 'solicitor']);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const organizationId = profile.organization_id;

  // super_admin without org context is allowed — they see all data
  if (!organizationId && profile.role !== 'super_admin') {
    return NextResponse.json({ error: 'No organization associated with this account' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const perPage = [25, 50].includes(parseInt(searchParams.get('per_page') ?? '25', 10))
    ? parseInt(searchParams.get('per_page') ?? '25', 10)
    : 25;
  const search = searchParams.get('search')?.trim() ?? '';
  const sort = searchParams.get('sort') ?? 'last_name';
  const order = searchParams.get('order') === 'desc' ? false : true;
  const solicitorIdParam = searchParams.get('solicitor_id') ?? '';

  const allowedSortColumns: Record<string, string> = {
    name: 'last_name',
    last_name: 'last_name',
    first_name: 'first_name',
    score: 'total_score',
    total_score: 'total_score',
    email: 'email',
  };
  const sortColumn = allowedSortColumns[sort] ?? 'last_name';

  // Use admin client for super_admin so RLS doesn't hide other orgs' rows.
  const supabase =
    profile.role === 'super_admin'
      ? createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        )
      : await createClient();

  let query = supabase
    .from('donors')
    .select('id, first_name, last_name, email, total_score, primary_solicitor_id', { count: 'exact' });

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  if (profile.role === 'solicitor') {
    query = query.eq('primary_solicitor_id', profile.id);
  } else if (solicitorIdParam) {
    query = query.eq('primary_solicitor_id', solicitorIdParam);
  }

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  query = query.order(sortColumn, { ascending: order });
  if (sortColumn !== 'last_name') {
    query = query.order('last_name', { ascending: true });
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data: donors, error, count } = await query;

  if (error) {
    console.error('Error fetching donors:', error);
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
  }

  // Fetch solicitor names separately to avoid FK join issues
  const solicitorIds = [...new Set((donors ?? []).map((d) => d.primary_solicitor_id).filter(Boolean))];
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
      .in('id', solicitorIds);
    solicitorMap = Object.fromEntries((solicitors ?? []).map((s) => [s.id, s]));
  }

  const donorRows = (donors ?? []).map((d) => {
    const sol = d.primary_solicitor_id ? solicitorMap[d.primary_solicitor_id] : null;
    const parts = (sol?.full_name ?? '').split(' ');
    return {
      ...d,
      score: d.total_score,
      tier: null,
      assigned_solicitor_id: d.primary_solicitor_id,
      solicitor: sol
        ? { id: sol.id, first_name: parts[0] ?? '', last_name: parts.slice(1).join(' ') }
        : null,
    };
  });

  return NextResponse.json({
    donors: donorRows,
    total: count ?? 0,
    page,
    per_page: perPage,
  });
}

export async function POST(request: NextRequest) {
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
    assertRole(profile, ['org_admin', 'super_admin']);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const organizationId = profile.organization_id;
  if (!organizationId) {
    return NextResponse.json({ error: 'No organization associated with this account' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { first_name, last_name } = body;
  if (!first_name || typeof first_name !== 'string' || first_name.trim() === '') {
    return NextResponse.json({ error: 'first_name is required' }, { status: 422 });
  }
  if (!last_name || typeof last_name !== 'string' || last_name.trim() === '') {
    return NextResponse.json({ error: 'last_name is required' }, { status: 422 });
  }

  const email = body.email as string | null | undefined;
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 422 });
    }
  }

  const supabase = await createClient();

  const fn = (first_name as string).trim();
  const ln = (last_name as string).trim();

  const donorInsert = {
    organization_id: organizationId,
    first_name: fn,
    last_name: ln,
    name: `${fn} ${ln}`,
    email: email || null,
    phone: (body.phone as string | null) || null,
    primary_solicitor_id: (body.primary_solicitor_id as string | null) || null,
    is_parent: body.is_parent === true,
    is_grandparent: body.is_grandparent === true,
    is_alumni: body.is_alumni === true,
    is_board_member: body.is_board_member === true,
    is_community_builder: body.is_community_builder === true,
    is_program_attendee: body.is_program_attendee === true,
    is_organization_volunteer: body.is_organization_volunteer === true || body.is_volunteer === true,
    has_donor_advised_fund: body.has_donor_advised_fund === true || body.is_donor_advised_fund === true,
    total_score: 0,
  };

  const { data: donor, error } = await supabase
    .from('donors')
    .insert(donorInsert as never)
    .select()
    .single();

  if (error) {
    console.error('Error inserting donor:', error);
    return NextResponse.json({ error: 'Failed to create donor' }, { status: 500 });
  }

  return NextResponse.json({ donor }, { status: 201 });
}

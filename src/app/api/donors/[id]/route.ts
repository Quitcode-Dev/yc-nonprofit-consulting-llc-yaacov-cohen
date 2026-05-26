import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import {
  getAuthenticatedUser,
  assertOrgAccess,
  assertDonorAccess,
  AuthorizationError,
} from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: donor, error } = await supabase
    .from('donors')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !donor) {
    return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
  }

  try {
    assertOrgAccess(profile, donor.organization_id);
    assertDonorAccess(profile, donor.primary_solicitor_id);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: moves } = await supabase
    .from('moves')
    .select('*')
    .eq('donor_id', id)
    .order('due_date', { ascending: false });

  const { data: donations } = await supabase
    .from('donations')
    .select('id, donated_at, amount, donation_type')
    .eq('donor_id', id)
    .order('donated_at', { ascending: false });

  // Fetch solicitor name if assigned
  let solicitor: { id: string; full_name: string | null } | null = null;
  if (donor.primary_solicitor_id) {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: sol } = await adminClient
      .from('user_roles')
      .select('id, full_name')
      .eq('id', donor.primary_solicitor_id)
      .maybeSingle();
    solicitor = sol ?? null;
  }

  return NextResponse.json({
    donor: { ...donor, solicitor },
    scoringConfigs: [],
    tierConfigs: [],
    moves: moves ?? [],
    donations: donations ?? [],
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from('donors')
    .select('id, organization_id, primary_solicitor_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
  }

  try {
    assertOrgAccess(profile, existing.organization_id);
    assertDonorAccess(profile, existing.primary_solicitor_id);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const allowedBooleans = [
    'is_parent',
    'is_grandparent',
    'is_alumni',
    'is_board_member',
    'is_community_builder',
    'is_program_attendee',
    'is_organization_volunteer',
    'has_donor_advised_fund',
  ];

  const updatePayload: Record<string, unknown> = {};

  for (const field of allowedBooleans) {
    if (field in body) {
      updatePayload[field] = body[field] === true;
    }
    // backwards compat aliases
    if (field === 'is_organization_volunteer' && 'is_volunteer' in body) {
      updatePayload[field] = body.is_volunteer === true;
    }
    if (field === 'has_donor_advised_fund' && 'is_donor_advised_fund' in body) {
      updatePayload[field] = body.is_donor_advised_fund === true;
    }
  }

  const scalarFields = ['first_name', 'last_name', 'email', 'phone', 'primary_solicitor_id'];
  for (const field of scalarFields) {
    if (field in body) {
      updatePayload[field] = body[field] ?? null;
    }
    // backwards compat
    if (field === 'primary_solicitor_id' && 'assigned_solicitor_id' in body) {
      updatePayload[field] = body.assigned_solicitor_id ?? null;
    }
  }

  // Update name if first_name or last_name changed
  const fn = (updatePayload.first_name as string | undefined) ?? undefined;
  const ln = (updatePayload.last_name as string | undefined) ?? undefined;
  if (fn !== undefined || ln !== undefined) {
    // Fetch current values if only one side changed
    const currentFn = fn ?? (body._current_first_name as string | undefined);
    const currentLn = ln ?? (body._current_last_name as string | undefined);
    if (currentFn && currentLn) {
      updatePayload.name = `${currentFn} ${currentLn}`;
    }
  }

  const { data: donor, error: updateError } = await supabase
    .from('donors')
    .update(updatePayload as never)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating donor:', updateError);
    return NextResponse.json({ error: 'Failed to update donor' }, { status: 500 });
  }

  return NextResponse.json({ donor });
}

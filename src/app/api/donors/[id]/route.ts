import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

  // 1. Authenticate
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];
  let user: Awaited<ReturnType<typeof getAuthenticatedUser>>['user'];

  try {
    const auth = await getAuthenticatedUser();
    user = auth.user;
    profile = auth.profile;
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  // 2. Fetch donor with joined solicitor
  const { data: donor, error } = await supabase
    .from('donors')
    .select(
      `*, solicitor:profiles!donors_assigned_solicitor_id_fkey(id, first_name, last_name)`
    )
    .eq('id', id)
    .single();

  if (error || !donor) {
    return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
  }

  // 3. Authorise — org access then donor access for solicitors
  try {
    assertOrgAccess(profile, donor.organization_id);
    assertDonorAccess(profile, donor.assigned_solicitor_id);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Fetch scoring configs
  const { data: scoringConfigs } = await supabase
    .from('scoring_configs')
    .select('field_name, point_value, is_enabled')
    .eq('organization_id', donor.organization_id);

  // 5. Fetch tier configs
  const { data: tierConfigs } = await supabase
    .from('tier_configs')
    .select('tier_name, min_score, max_score, moves_needed')
    .eq('organization_id', donor.organization_id)
    .order('min_score', { ascending: false });

  // 6. Fetch moves with solicitor info
  const { data: moves } = await supabase
    .from('moves')
    .select(
      `*, solicitor:profiles!moves_solicitor_id_fkey(id, first_name, last_name)`
    )
    .eq('donor_id', id)
    .order('due_date', { ascending: false });

  // 7. Fetch donation history
  const { data: donations } = await supabase
    .from('donation_history')
    .select('id, date, amount')
    .eq('donor_id', id)
    .order('date', { ascending: false });

  return NextResponse.json({
    donor,
    scoringConfigs: scoringConfigs ?? [],
    tierConfigs: tierConfigs ?? [],
    moves: moves ?? [],
    donations: donations ?? [],
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  // 1. Authenticate
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

  // 2. Fetch existing donor to verify access
  const { data: existing, error: fetchError } = await supabase
    .from('donors')
    .select('id, organization_id, assigned_solicitor_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
  }

  // 3. Authorise
  try {
    assertOrgAccess(profile, existing.organization_id);
    assertDonorAccess(profile, existing.assigned_solicitor_id);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // 5. Recalculate score from scoring_configs
  const { data: scoringConfigs } = await supabase
    .from('scoring_configs')
    .select('field_name, point_value, is_enabled')
    .eq('organization_id', existing.organization_id);

  let score = 0;
  if (scoringConfigs && scoringConfigs.length > 0) {
    for (const config of scoringConfigs) {
      if (!config.is_enabled) continue;
      const fieldValue = body[config.field_name];
      if (fieldValue === true) {
        score += Number(config.point_value) || 0;
      }
    }
  }

  // 6. Determine tier
  let tier: string | null = null;
  const { data: tierConfigs } = await supabase
    .from('tier_configs')
    .select('tier_name, min_score, max_score')
    .eq('organization_id', existing.organization_id)
    .order('min_score', { ascending: false });

  if (tierConfigs && tierConfigs.length > 0) {
    const matched = tierConfigs.find(
      (t) => score >= Number(t.min_score) && score <= Number(t.max_score)
    );
    tier = matched?.tier_name ?? null;
  }

  // 7. Build update payload — only allow known fields
  const allowedBooleans = [
    'is_parent',
    'is_grandparent',
    'is_alumni',
    'is_board_member',
    'is_community_builder',
    'is_program_attendee',
    'is_volunteer',
    'is_donor_advised_fund',
    'is_foundation_trustee',
  ];

  const updatePayload: Record<string, unknown> = { score, tier };

  for (const field of allowedBooleans) {
    if (field in body) {
      updatePayload[field] = body[field] === true;
    }
  }

  const scalarFields = ['first_name', 'last_name', 'email', 'phone', 'capacity', 'assigned_solicitor_id'];
  for (const field of scalarFields) {
    if (field in body) {
      updatePayload[field] = body[field] ?? null;
    }
  }

  // 8. Persist
  const { data: donor, error: updateError } = await supabase
    .from('donors')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating donor:', updateError);
    return NextResponse.json({ error: 'Failed to update donor' }, { status: 500 });
  }

  return NextResponse.json({ donor });
}

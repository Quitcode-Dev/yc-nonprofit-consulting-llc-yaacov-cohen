import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole, AuthorizationError } from '@/lib/auth/authorize';

export async function POST(request: NextRequest) {
  // 1. Authenticate & authorise
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

  // 2. Parse & validate body
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

  // Validate email format server-side if provided
  const email = body.email as string | null | undefined;
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 422 });
    }
  }

  const supabase = await createClient();

  // 3. Calculate initial score from scoring_configs
  const { data: scoringConfigs } = await supabase
    .from('scoring_configs')
    .select('field_name, point_value, is_enabled')
    .eq('organization_id', organizationId);

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

  // 4. Determine tier from tier_configs
  let tier: string | null = null;
  const { data: tierConfigs } = await supabase
    .from('tier_configs')
    .select('tier_name, min_score, max_score')
    .eq('organization_id', organizationId)
    .order('min_score', { ascending: false });

  if (tierConfigs && tierConfigs.length > 0) {
    const matchedTier = tierConfigs.find(
      (t) => score >= Number(t.min_score) && score <= Number(t.max_score)
    );
    tier = matchedTier?.tier_name ?? null;
  }

  // 5. Insert donor
  const donorInsert = {
    organization_id: organizationId,
    first_name: (first_name as string).trim(),
    last_name: (last_name as string).trim(),
    email: email || null,
    phone: (body.phone as string | null) || null,
    capacity: body.capacity != null ? Number(body.capacity) : null,
    assigned_solicitor_id: (body.assigned_solicitor_id as string | null) || null,
    is_parent: body.is_parent === true,
    is_grandparent: body.is_grandparent === true,
    is_alumni: body.is_alumni === true,
    is_board_member: body.is_board_member === true,
    is_community_builder: body.is_community_builder === true,
    is_program_attendee: body.is_program_attendee === true,
    is_volunteer: body.is_volunteer === true,
    is_donor_advised_fund: body.is_donor_advised_fund === true,
    is_foundation_trustee: body.is_foundation_trustee === true,
    score,
    tier,
  };

  const { data: donor, error } = await supabase
    .from('donors')
    .insert(donorInsert)
    .select()
    .single();

  if (error) {
    console.error('Error inserting donor:', error);
    return NextResponse.json({ error: 'Failed to create donor' }, { status: 500 });
  }

  return NextResponse.json({ donor }, { status: 201 });
}

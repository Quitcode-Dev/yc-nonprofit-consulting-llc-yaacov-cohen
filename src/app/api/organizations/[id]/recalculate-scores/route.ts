import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole, assertOrgAccess } from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
    assertRole(profile, ['super_admin', 'org_admin']);
    assertOrgAccess(profile, id);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = (err as Error).message ?? 'Unauthorized';
    return NextResponse.json({ error: message }, { status });
  }

  const supabase = await createClient();

  // Load enabled scoring configs for this org
  const { data: configs, error: configError } = await supabase
    .from('scoring_config')
    .select('field_name, point_value')
    .eq('organization_id', id)
    .eq('is_enabled', true);

  if (configError) {
    return NextResponse.json({ error: 'Failed to load scoring config' }, { status: 500 });
  }

  const enabledConfigs = configs ?? [];

  // Load all donors for this org
  const { data: donors, error: donorsError } = await supabase
    .from('donors')
    .select('id, is_parent, is_grandparent, is_alumni, is_board_member, is_community_builder, is_program_attendee, is_volunteer, is_donor_advised_fund, is_foundation_trustee')
    .eq('organization_id', id);

  if (donorsError) {
    return NextResponse.json({ error: 'Failed to load donors' }, { status: 500 });
  }

  // Load tier configs for this org ordered by min_score ascending
  const { data: tierConfigs, error: tierConfigError } = await supabase
    .from('tier_config')
    .select('name, min_score, max_score')
    .eq('organization_id', id)
    .order('min_score', { ascending: true });

  if (tierConfigError) {
    return NextResponse.json({ error: 'Failed to load tier config' }, { status: 500 });
  }

  const tiers = tierConfigs ?? [];

  if (!donors || donors.length === 0) {
    return NextResponse.json({ updated_count: 0 });
  }

  const now = new Date().toISOString();

  // Calculate score and tier for each donor
  const updates = donors.map((donor) => {
    let score = 0;
    for (const config of enabledConfigs) {
      const fieldValue = (donor as Record<string, unknown>)[config.field_name];
      if (fieldValue === true) {
        score += config.point_value;
      }
    }

    const matchedTier = tiers.find(
      (tier) => score >= tier.min_score && score <= tier.max_score
    );
    const tier: string | null = matchedTier ? matchedTier.name : null;

    return { id: donor.id, score, tier, updated_at: now };
  });

  // Batch upsert scores and tiers
  const { error: updateError } = await supabase
    .from('donors')
    .upsert(updates, { onConflict: 'id' });

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update donor scores' }, { status: 500 });
  }

  return NextResponse.json({ updated_count: updates.length });
}

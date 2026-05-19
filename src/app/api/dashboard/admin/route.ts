import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole } from '@/lib/auth/authorize';

export async function GET() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    assertRole(profile, ['org_admin', 'super_admin']);
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const orgId = profile.organization_id;
  if (!orgId) {
    return NextResponse.json({ error: 'No organization associated with this account' }, { status: 400 });
  }

  const supabase = await createClient();

  // ── Total donors ──────────────────────────────────────────────────────────
  const { count: total_donors, error: donorsCountError } = await supabase
    .from('donors')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);

  if (donorsCountError) {
    return NextResponse.json({ error: 'Failed to fetch donor count' }, { status: 500 });
  }

  // ── Total moves ───────────────────────────────────────────────────────────
  const { count: total_moves, error: movesCountError } = await supabase
    .from('moves')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);

  if (movesCountError) {
    return NextResponse.json({ error: 'Failed to fetch moves count' }, { status: 500 });
  }

  // ── Completed moves ───────────────────────────────────────────────────────
  const { count: moves_completed, error: completedError } = await supabase
    .from('moves')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'completed');

  if (completedError) {
    return NextResponse.json({ error: 'Failed to fetch completed moves count' }, { status: 500 });
  }

  // ── Pending moves ─────────────────────────────────────────────────────────
  const { count: pending_moves, error: pendingError } = await supabase
    .from('moves')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'pending');

  if (pendingError) {
    return NextResponse.json({ error: 'Failed to fetch pending moves count' }, { status: 500 });
  }

  // ── Moves needed: sum tier_config.moves_needed per donor tier ─────────────
  const { data: tierConfig, error: tierConfigError } = await supabase
    .from('tier_configs')
    .select('tier, moves_needed')
    .eq('organization_id', orgId);

  if (tierConfigError) {
    return NextResponse.json({ error: 'Failed to fetch tier config' }, { status: 500 });
  }

  const { data: donorTiers, error: donorTiersError } = await supabase
    .from('donors')
    .select('tier')
    .eq('organization_id', orgId);

  if (donorTiersError) {
    return NextResponse.json({ error: 'Failed to fetch donor tiers' }, { status: 500 });
  }

  const tierMovesMap: Record<string, number> = {};
  for (const tc of tierConfig ?? []) {
    tierMovesMap[tc.tier] = tc.moves_needed ?? 0;
  }

  const moves_needed = (donorTiers ?? []).reduce((sum, d) => {
    return sum + (d.tier ? (tierMovesMap[d.tier] ?? 0) : 0);
  }, 0);

  // ── Leaderboard: avg donor score per solicitor ────────────────────────────
  const { data: solicitors, error: solicitorsError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('organization_id', orgId)
    .eq('role', 'solicitor')
    .eq('is_active', true);

  if (solicitorsError) {
    return NextResponse.json({ error: 'Failed to fetch solicitors' }, { status: 500 });
  }

  const { data: assignedDonors, error: assignedDonorsError } = await supabase
    .from('donors')
    .select('assigned_solicitor_id, score')
    .eq('organization_id', orgId)
    .not('assigned_solicitor_id', 'is', null);

  if (assignedDonorsError) {
    return NextResponse.json({ error: 'Failed to fetch assigned donors' }, { status: 500 });
  }

  // Group scores by solicitor
  const scoresBySolicitor: Record<string, number[]> = {};
  for (const d of assignedDonors ?? []) {
    if (!d.assigned_solicitor_id) continue;
    if (!scoresBySolicitor[d.assigned_solicitor_id]) {
      scoresBySolicitor[d.assigned_solicitor_id] = [];
    }
    scoresBySolicitor[d.assigned_solicitor_id].push(d.score ?? 0);
  }

  const leaderboard = (solicitors ?? [])
    .map((s) => {
      const scores = scoresBySolicitor[s.id] ?? [];
      const avg_score =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
      return {
        id: s.id,
        solicitor_name: `${s.first_name} ${s.last_name}`,
        avg_score,
        donor_count: scores.length,
      };
    })
    .sort((a, b) => b.avg_score - a.avg_score);

  // ── Recent activity: last 10 completed moves ──────────────────────────────
  const { data: recentRaw, error: recentError } = await supabase
    .from('moves')
    .select(`
      id,
      title,
      completed_at,
      donor:donors(first_name, last_name),
      solicitor:profiles(first_name, last_name)
    `)
    .eq('organization_id', orgId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(10);

  if (recentError) {
    return NextResponse.json({ error: 'Failed to fetch recent activity' }, { status: 500 });
  }

  const recent_activity = (recentRaw ?? []).map((m) => {
    const move = m as typeof m & {
      donor: { first_name: string; last_name: string } | null;
      solicitor: { first_name: string; last_name: string } | null;
    };
    return {
      id: move.id,
      title: move.title,
      donor_name: move.donor
        ? `${move.donor.first_name} ${move.donor.last_name}`
        : 'Unknown',
      solicitor_name: move.solicitor
        ? `${move.solicitor.first_name} ${move.solicitor.last_name}`
        : 'Unknown',
      completed_at: move.completed_at,
    };
  });

  return NextResponse.json({
    total_donors: total_donors ?? 0,
    moves_needed,
    total_moves: total_moves ?? 0,
    moves_completed: moves_completed ?? 0,
    pending_moves: pending_moves ?? 0,
    leaderboard,
    recent_activity,
  });
}

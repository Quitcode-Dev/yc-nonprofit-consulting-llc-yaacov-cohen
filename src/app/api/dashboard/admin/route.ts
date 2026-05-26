import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole } from '@/lib/auth/authorize';

export async function GET() {
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

  const [
    { count: total_donors },
    { count: total_moves },
    { count: moves_completed },
    { count: pending_moves },
  ] = await Promise.all([
    supabase.from('donors').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('moves').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('moves').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('is_completed', true),
    supabase.from('moves').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('is_completed', false),
  ]);

  // moves_needed: sum donors.moves_needed (computed column on real schema)
  const { data: donorMoves } = await supabase
    .from('donors')
    .select('moves_needed')
    .eq('organization_id', orgId);

  const moves_needed = (donorMoves ?? []).reduce((sum, d) => sum + (d.moves_needed ?? 0), 0);

  // Leaderboard: avg donor score per user_role (solicitor)
  const [{ data: solicitorRoles }, { data: assignedDonors }] = await Promise.all([
    supabase.from('user_roles').select('id, full_name').eq('organization_id', orgId).eq('is_active', true),
    supabase.from('donors').select('primary_solicitor_id, total_score').eq('organization_id', orgId).not('primary_solicitor_id', 'is', null),
  ]);

  const scoresBySolicitor: Record<string, number[]> = {};
  for (const d of assignedDonors ?? []) {
    if (!d.primary_solicitor_id) continue;
    if (!scoresBySolicitor[d.primary_solicitor_id]) scoresBySolicitor[d.primary_solicitor_id] = [];
    scoresBySolicitor[d.primary_solicitor_id].push(d.total_score ?? 0);
  }

  const leaderboard = (solicitorRoles ?? [])
    .map((s) => {
      const scores = scoresBySolicitor[s.id] ?? [];
      return {
        id: s.id,
        solicitor_name: s.full_name ?? '',
        avg_score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        donor_count: scores.length,
      };
    })
    .sort((a, b) => b.avg_score - a.avg_score);

  // Recent activity: last 10 completed moves with donor + solicitor names
  const { data: recentRaw } = await supabase
    .from('moves')
    .select('id, name, completed_at, donor_id, assigned_to')
    .eq('organization_id', orgId)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })
    .limit(10);

  const donorIds = [...new Set((recentRaw ?? []).map((m) => m.donor_id).filter(Boolean))];
  const roleIds  = [...new Set((recentRaw ?? []).map((m) => m.assigned_to).filter(Boolean))];

  const [{ data: recentDonors }, { data: recentRoles }] = await Promise.all([
    donorIds.length ? supabase.from('donors').select('id, name').in('id', donorIds) : Promise.resolve({ data: [] }),
    roleIds.length  ? supabase.from('user_roles').select('id, full_name').in('id', roleIds) : Promise.resolve({ data: [] }),
  ]);

  const donorMap = Object.fromEntries((recentDonors ?? []).map((d) => [d.id, d.name]));
  const roleMap  = Object.fromEntries((recentRoles  ?? []).map((r) => [r.id, r.full_name]));

  const recent_activity = (recentRaw ?? []).map((m) => ({
    id: m.id,
    title: m.name,
    donor_name: donorMap[m.donor_id] ?? 'Unknown',
    solicitor_name: roleMap[m.assigned_to] ?? 'Unknown',
    completed_at: m.completed_at,
  }));

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

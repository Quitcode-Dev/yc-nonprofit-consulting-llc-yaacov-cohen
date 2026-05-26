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
    assertRole(profile, ['solicitor']);
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: donors, error: donorsError } = await supabase
    .from('donors')
    .select('*')
    .eq('organization_id', profile.organization_id!)
    .eq('primary_solicitor_id', profile.id)
    .order('total_score', { ascending: false });

  if (donorsError) {
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
  }

  const { data: movesRaw, error: movesError } = await supabase
    .from('moves')
    .select(`
      *,
      donor:donors(first_name, last_name)
    `)
    .eq('assigned_to', profile.id)
    .eq('is_completed', false)
    .order('due_date', { ascending: true });

  if (movesError) {
    return NextResponse.json({ error: 'Failed to fetch moves' }, { status: 500 });
  }

  const moves = (movesRaw ?? []).map((m) => {
    const { donor, ...rest } = m as typeof m & {
      donor: { first_name: string; last_name: string } | null;
    };
    return {
      ...rest,
      donor_name: donor ? `${donor.first_name} ${donor.last_name}` : undefined,
    };
  });

  const pending_moves = moves.filter((m) => m.due_date >= today);
  const overdue_moves = moves.filter((m) => m.due_date < today);

  return NextResponse.json({
    donors: donors ?? [],
    pending_moves,
    overdue_moves,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id: orgId } = await context.params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];
  try {
    const auth = await getAuthenticatedUser(request);
    profile = auth.profile;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (profile.role !== 'super_admin' && profile.organization_id !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tier_configs')
    .select('*')
    .eq('organization_id', orgId)
    .order('min_score', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tiers: data });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id: orgId } = await context.params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];
  try {
    const auth = await getAuthenticatedUser(request);
    profile = auth.profile;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (profile.role !== 'super_admin' && profile.organization_id !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { tiers?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const tiers = body.tiers;
  if (!Array.isArray(tiers)) {
    return NextResponse.json({ error: 'tiers must be an array' }, { status: 400 });
  }

  const supabase = await createClient();

  // Delete all existing tiers for this org, then insert the new set
  const { error: deleteError } = await supabase
    .from('tier_configs')
    .delete()
    .eq('organization_id', orgId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (tiers.length > 0) {
    const rows = tiers.map((t: { tier_name: string; min_score: number; max_score: number; moves_needed: number }) => ({
      organization_id: orgId,
      tier_name: t.tier_name,
      min_score: t.min_score,
      max_score: t.max_score,
      moves_needed: t.moves_needed,
    }));

    const { error: insertError } = await supabase.from('tier_configs').insert(rows);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

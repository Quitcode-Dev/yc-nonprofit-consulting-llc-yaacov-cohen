import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole, assertOrgAccess } from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  // Authenticate & authorise
  try {
    const auth = await getAuthenticatedUser();
    assertRole(auth.profile, ['super_admin', 'org_admin']);
    assertOrgAccess(auth.profile, id);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = (err as Error).message ?? 'Unauthorized';
    return NextResponse.json({ error: message }, { status });
  }

  const supabase = await createClient();

  // Fetch solicitor profiles for this org
  const { data: solicitors, error: solicitorsError } = await supabase
    .from('user_profile')
    .select('id, first_name, last_name, email, is_active, created_at')
    .eq('organization_id', id)
    .eq('role', 'solicitor');

  if (solicitorsError) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }

  // Fetch pending (unused) invitations for this org
  const { data: invitations, error: invitationsError } = await supabase
    .from('invitations')
    .select('id, email, first_name, last_name, created_at')
    .eq('organization_id', id)
    .eq('is_used', false);

  if (invitationsError) {
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }

  return NextResponse.json({
    solicitors: solicitors ?? [],
    invitations: invitations ?? [],
  });
}

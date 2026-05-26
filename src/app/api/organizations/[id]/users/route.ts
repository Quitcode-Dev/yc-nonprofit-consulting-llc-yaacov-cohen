import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getAuthenticatedUser, assertRole, assertOrgAccess } from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    const auth = await getAuthenticatedUser();
    assertRole(auth.profile, ['super_admin', 'org_admin']);
    assertOrgAccess(auth.profile, id);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = (err as Error).message ?? 'Unauthorized';
    return NextResponse.json({ error: message }, { status });
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: solicitors, error: solicitorsError } = await adminClient
    .from('user_roles')
    .select('id, email, full_name, is_active, created_at')
    .eq('organization_id', id)
    .eq('role', 'solicitor');

  if (solicitorsError) {
    console.error('[users] solicitors fetch error:', solicitorsError.message);
    return NextResponse.json({ error: solicitorsError.message }, { status: 500 });
  }

  const { data: invitations, error: invitationsError } = await adminClient
    .from('invitations')
    .select('id, email, first_name, last_name, created_at')
    .eq('organization_id', id)
    .eq('is_used', false);

  if (invitationsError) {
    console.error('[users] invitations fetch error:', invitationsError.message);
    return NextResponse.json({ error: invitationsError.message }, { status: 500 });
  }

  // Split full_name into first_name / last_name for the client
  const solicitorRows = (solicitors ?? []).map((s) => {
    const parts = (s.full_name ?? '').split(' ');
    return {
      ...s,
      first_name: parts[0] ?? null,
      last_name: parts.slice(1).join(' ') || null,
    };
  });

  return NextResponse.json({
    solicitors: solicitorRows,
    invitations: invitations ?? [],
  });
}

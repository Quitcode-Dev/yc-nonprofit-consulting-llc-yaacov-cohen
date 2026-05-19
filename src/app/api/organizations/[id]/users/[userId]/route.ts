import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole, assertOrgAccess } from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string; userId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id, userId } = await params;

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

  let body: { is_active?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof body.is_active !== 'boolean') {
    return NextResponse.json({ error: 'is_active must be a boolean' }, { status: 400 });
  }

  const supabase = await createClient();

  // Ensure the target user belongs to this org and is a solicitor
  const { data: existing, error: fetchError } = await supabase
    .from('user_profile')
    .select('id, organization_id, role')
    .eq('id', userId)
    .eq('organization_id', id)
    .eq('role', 'solicitor')
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { data: updated, error: updateError } = await supabase
    .from('user_profile')
    .update({
      is_active: body.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }

  return NextResponse.json(updated);
}

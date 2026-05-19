import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole } from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  // Authenticate & authorise
  try {
    const auth = await getAuthenticatedUser();
    assertRole(auth.profile, ['super_admin']);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = (err as Error).message ?? 'Unauthorized';
    return NextResponse.json({ error: message }, { status });
  }

  const supabase = await createClient();

  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  return NextResponse.json(org);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  // Authenticate & authorise
  try {
    const auth = await getAuthenticatedUser();
    assertRole(auth.profile, ['super_admin']);
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
    return NextResponse.json(
      { error: 'is_active must be a boolean' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: org, error } = await supabase
    .from('organizations')
    .update({
      is_active: body.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !org) {
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }

  return NextResponse.json(org);
}

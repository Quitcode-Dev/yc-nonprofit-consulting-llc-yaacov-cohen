import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole, assertOrgAccess } from '@/lib/auth/authorize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
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

  const { data, error } = await supabase
    .from('scoring_config')
    .select('id, field_name, is_enabled, point_value')
    .eq('organization_id', id)
    .order('field_name');

  if (error) {
    return NextResponse.json({ error: 'Failed to load scoring config' }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'Body must be an array' }, { status: 400 });
  }

  for (const item of body) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof (item as Record<string, unknown>).field_name !== 'string' ||
      typeof (item as Record<string, unknown>).is_enabled !== 'boolean' ||
      typeof (item as Record<string, unknown>).point_value !== 'number' ||
      !Number.isInteger((item as Record<string, unknown>).point_value) ||
      (item as Record<string, unknown>).point_value < 1
    ) {
      return NextResponse.json(
        { error: 'Each item must have field_name (string), is_enabled (boolean), point_value (positive integer)' },
        { status: 400 }
      );
    }
  }

  const supabase = await createClient();

  const upsertRows = (body as { field_name: string; is_enabled: boolean; point_value: number }[]).map(
    (item) => ({
      organization_id: id,
      field_name: item.field_name,
      is_enabled: item.is_enabled,
      point_value: item.point_value,
      updated_at: new Date().toISOString(),
    })
  );

  const { data, error } = await supabase
    .from('scoring_config')
    .upsert(upsertRows, { onConflict: 'organization_id,field_name' })
    .select('id, field_name, is_enabled, point_value');

  if (error) {
    return NextResponse.json({ error: 'Failed to save scoring config' }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

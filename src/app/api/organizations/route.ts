import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole } from '@/lib/auth/authorize';

export async function POST(request: NextRequest) {
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    assertRole(profile, ['super_admin']);
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name } = body;

  if (!name || name.trim().length < 2) {
    return NextResponse.json(
      { error: 'Name must be at least 2 characters' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: existing, error: lookupError } = await supabase
    .from('organizations')
    .select('id')
    .ilike('name', name.trim())
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ error: 'duplicate_name' }, { status: 409 });
  }

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const { data: newOrg, error: insertError } = await supabase
    .from('organizations')
    .insert({ name: name.trim(), slug } as never)
    .select()
    .single();

  if (insertError || !newOrg) {
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }

  return NextResponse.json(newOrg, { status: 201 });
}

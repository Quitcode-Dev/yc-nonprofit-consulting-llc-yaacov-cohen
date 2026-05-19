import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole } from '@/lib/auth/authorize';

const BOOLEAN_SCORING_FIELDS = [
  'is_parent',
  'is_grandparent',
  'is_board_member',
  'is_volunteer',
  'is_recurring_donor',
  'is_major_donor',
  'is_lapsed_donor',
  'is_email_subscriber',
  'is_event_attendee',
];

export async function POST(request: NextRequest) {
  // 1. Authenticate & authorise
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

  // 2. Parse body
  let body: { name?: string; contact_name?: string; contact_email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, contact_name, contact_email } = body;

  if (!name || name.trim().length < 2) {
    return NextResponse.json(
      { error: 'Name must be at least 2 characters' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // 3. Check for duplicate name (case-insensitive)
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

  // 4. Insert organization
  const { data: newOrg, error: insertError } = await supabase
    .from('organizations')
    .insert({
      name: name.trim(),
      contact_name: contact_name?.trim() || null,
      contact_email: contact_email?.trim() || null,
      is_active: true,
    })
    .select()
    .single();

  if (insertError || !newOrg) {
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }

  // 5. Seed default scoring configs (non-fatal if this fails)
  const scoringRows = BOOLEAN_SCORING_FIELDS.map((field_name) => ({
    organization_id: newOrg.id,
    field_name,
    is_enabled: false,
    point_value: 0,
  }));

  const { error: scoringError } = await supabase
    .from('scoring_configs')
    .insert(scoringRows);

  if (scoringError) {
    console.error('Failed to seed scoring configs for org', newOrg.id, scoringError);
  }

  return NextResponse.json(newOrg, { status: 201 });
}

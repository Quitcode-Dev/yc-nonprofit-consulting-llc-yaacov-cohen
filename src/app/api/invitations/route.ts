import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser, assertRole } from '@/lib/auth/authorize';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message.toLowerCase().includes('forbidden') ||
                   message.toLowerCase().includes('role') ||
                   message.toLowerCase().includes('insufficient')
      ? 403
      : 401;
    return NextResponse.json({ error: message }, { status });
  }

  try {
    assertRole(profile, ['super_admin', 'org_admin']);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Forbidden';
    return NextResponse.json({ error: message }, { status: 403 });
  }

  let body: {
    email?: unknown;
    first_name?: unknown;
    last_name?: unknown;
    organization_id?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, first_name, last_name, organization_id } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }
  if (!organization_id || typeof organization_id !== 'string') {
    return NextResponse.json({ error: 'organization_id is required' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (profile.role === 'org_admin' && profile.organization_id !== organization_id) {
    return NextResponse.json(
      { error: 'org_admin may only invite users to their own organisation' },
      { status: 403 }
    );
  }

  // Check for existing active user with this email in the org
  const { data: existingUsers, error: lookupError } = await supabase
    .from('user_roles')
    .select('id')
    .eq('email', normalizedEmail)
    .eq('organization_id', organization_id)
    .eq('is_active', true)
    .limit(1);

  if (lookupError) {
    console.error('[invitations] duplicate check error:', lookupError);
    return NextResponse.json({ error: 'Database error during duplicate check' }, { status: 500 });
  }

  if (existingUsers && existingUsers.length > 0) {
    return NextResponse.json(
      { error: 'An active user with this email already exists in the organisation' },
      { status: 400 }
    );
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

  const { data: invitation, error: insertError } = await supabase
    .from('invitations')
    .insert({
      email: normalizedEmail,
      organization_id,
      token,
      expires_at: expiresAt,
      ...(first_name && typeof first_name === 'string' ? { first_name: first_name.trim() } : {}),
      ...(last_name && typeof last_name === 'string' ? { last_name: last_name.trim() } : {}),
    })
    .select('id')
    .single();

  if (insertError || !invitation) {
    console.error('[invitations] insert error:', insertError);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get('origin') ||
    'http://localhost:3000';

  const inviteLink = `${origin}/invite?token=${token}`;

  const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(
    normalizedEmail,
    {
      redirectTo: inviteLink,
      data: {
        invitation_id: invitation.id,
        organization_id,
        first_name: typeof first_name === 'string' ? first_name.trim() : undefined,
        last_name: typeof last_name === 'string' ? last_name.trim() : undefined,
        custom_invite_token: token,
      },
    }
  );

  if (emailError) {
    console.error('[invitations] email send error:', emailError);

    const { error: deleteError } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitation.id);

    if (deleteError) {
      console.error('[invitations] rollback error:', deleteError);
    }

    return NextResponse.json({ error: 'Failed to send invitation email' }, { status: 500 });
  }

  return NextResponse.json(
    {
      invitation_id: invitation.id,
      email: normalizedEmail,
      status: 'sent',
    },
    { status: 201 }
  );
}

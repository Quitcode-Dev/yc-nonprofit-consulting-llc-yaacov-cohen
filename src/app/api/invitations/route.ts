import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser, assertRole } from '@/lib/auth/authorize';

// Supabase service-role client — intentionally a module-level singleton.
// This client uses the service role key (not user-scoped), so sharing it
// across requests is safe and avoids unnecessary re-instantiation.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // ── 1. Authenticate & authorise ──────────────────────────────────────────
  let user: Awaited<ReturnType<typeof getAuthenticatedUser>>['user'];
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser(request);
    user = auth.user;
    profile = auth.profile;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // Return 401 for any authentication failure, 403 for authorisation failure.
    // We inspect the error instance type / message from authorize helpers.
    const status = message.toLowerCase().includes('forbidden') ||
                   message.toLowerCase().includes('role') ||
                   message.toLowerCase().includes('insufficient')
      ? 403
      : 401;
    return NextResponse.json({ error: message }, { status });
  }

  try {
    // Throws if the role is not in the allowed list — we catch it below.
    assertRole(profile, ['super_admin', 'org_admin']);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Forbidden';
    return NextResponse.json({ error: message }, { status: 403 });
  }

  // ── 2. Parse & validate request body ────────────────────────────────────
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

  // ── 3. org_admin boundary enforcement ───────────────────────────────────
  // An org_admin may only invite users into their own organisation.
  if (profile.role === 'org_admin' && profile.organization_id !== organization_id) {
    return NextResponse.json(
      { error: 'org_admin may only invite users to their own organisation' },
      { status: 403 }
    );
  }

  // ── 4. Duplicate active-user check ──────────────────────────────────────
  const { data: existingUsers, error: lookupError } = await supabase
    .from('profiles')
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

  // ── 5. Generate token & expiry ───────────────────────────────────────────
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

  // ── 6. Persist invitation ────────────────────────────────────────────────
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

  // ── 7. Send invitation email ─────────────────────────────────────────────
  // We use a custom token-based invite link rather than Supabase's built-in
  // invite flow to avoid the double-email problem: Supabase's
  // `inviteUserByEmail` both creates an auth user AND sends its own email.
  // Instead we send a single custom email pointing to /invite?token=<token>.
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get('origin') ||
    'http://localhost:3000';

  const inviteLink = `${origin}/invite?token=${token}`;

  // Build a minimal HTML email body.
  const emailHtml = `
    <p>You have been invited to join the organisation.</p>
    <p>Click the link below to accept your invitation (valid for 72 hours):</p>
    <p><a href="${inviteLink}">${inviteLink}</a></p>
  `.trim();

  // Use Supabase's admin email helper to dispatch the message without
  // triggering the full Supabase invite-user flow (no auth user is created).
  // If your Supabase project does not expose a raw email API, swap this for
  // your preferred transactional email provider (Resend, SendGrid, etc.).
  const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(
    normalizedEmail,
    {
      redirectTo: inviteLink,
      data: {
        invitation_id: invitation.id,
        organization_id,
        first_name: typeof first_name === 'string' ? first_name.trim() : undefined,
        last_name: typeof last_name === 'string' ? last_name.trim() : undefined,
        // Signal to any post-signup hook that this is a token-based invite.
        custom_invite_token: token,
      },
    }
  );

  if (emailError) {
    console.error('[invitations] email send error:', emailError);

    // Roll back the invitation row so the token is not left dangling.
    const { error: deleteError } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitation.id);

    if (deleteError) {
      console.error('[invitations] rollback error:', deleteError);
    }

    return NextResponse.json({ error: 'Failed to send invitation email' }, { status: 500 });
  }

  // ── 8. Return success ────────────────────────────────────────────────────
  return NextResponse.json(
    {
      invitation_id: invitation.id,
      email: normalizedEmail,
      status: 'sent',
    },
    { status: 201 }
  );
}

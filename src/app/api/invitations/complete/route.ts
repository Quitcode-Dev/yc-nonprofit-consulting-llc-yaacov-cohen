import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
  return null;
}

export async function POST(request: NextRequest) {
  let body: { token?: string; first_name?: string; last_name?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { token, first_name, last_name, password } = body;

  if (!token || !first_name || !last_name || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const supabase = await createClient();

  // Re-validate the invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select('id, email, organization_id, is_used, expires_at')
    .eq('token', token)
    .single();

  if (inviteError || !invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }

  if (invitation.is_used) {
    return NextResponse.json({ error: 'This invitation has already been used' }, { status: 400 });
  }

  if (new Date(invitation.expires_at) <= new Date()) {
    return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 });
  }

  // Create admin client for user creation
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Create the Supabase auth user
  const { data: authData, error: createUserError } = await adminClient.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
  });

  if (createUserError || !authData.user) {
    return NextResponse.json(
      { error: createUserError?.message ?? 'Failed to create user' },
      { status: 500 }
    );
  }

  const newUserId = authData.user.id;

  // Create user_profiles row
  const { error: profileError } = await supabase.from('user_profiles').insert({
    id: newUserId,
    email: invitation.email,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    role: 'solicitor',
    organization_id: invitation.organization_id,
    is_active: true,
  });

  if (profileError) {
    // Rollback: delete the auth user
    await adminClient.auth.admin.deleteUser(newUserId);
    return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
  }

  // Mark invitation as used
  const { error: updateError } = await supabase
    .from('invitations')
    .update({ is_used: true })
    .eq('id', invitation.id);

  if (updateError) {
    // Non-fatal but log it; user was created successfully
    console.error('Failed to mark invitation as used:', updateError);
  }

  return NextResponse.json({ success: true });
}

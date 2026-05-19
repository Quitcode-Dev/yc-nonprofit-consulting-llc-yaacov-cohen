import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ valid: false, reason: 'not_found' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('id, email, organization_id, is_used, expires_at')
    .eq('token', token)
    .single();

  if (error || !invitation) {
    return NextResponse.json({ valid: false, reason: 'not_found' }, { status: 404 });
  }

  if (invitation.is_used) {
    return NextResponse.json({ valid: false, reason: 'used' }, { status: 200 });
  }

  if (new Date(invitation.expires_at) <= new Date()) {
    return NextResponse.json({ valid: false, reason: 'expired' }, { status: 200 });
  }

  return NextResponse.json({
    valid: true,
    email: invitation.email,
    organization_id: invitation.organization_id,
  });
}

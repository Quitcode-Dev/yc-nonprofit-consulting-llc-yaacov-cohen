import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('id, role, organization_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!userRole) {
    return NextResponse.json({ error: 'User role not found' }, { status: 404 });
  }

  const role = userRole.role === 'organization_admin' ? 'org_admin' : userRole.role;

  return NextResponse.json({
    profile: {
      id: userRole.id,
      role,
      organization_id: userRole.organization_id,
    },
  });
}

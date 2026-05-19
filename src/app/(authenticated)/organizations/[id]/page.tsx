import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole } from '@/lib/auth/authorize';
import { OrganizationDetailClient } from './organization-detail-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const { id } = await params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];

  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
  } catch {
    redirect('/login');
  }

  try {
    assertRole(profile, ['super_admin']);
  } catch {
    redirect('/dashboard');
  }

  const supabase = await createClient();

  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !org) {
    notFound();
  }

  return <OrganizationDetailClient org={org} />;
}

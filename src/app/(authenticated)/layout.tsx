import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/top-bar'
import type { UserProfile } from '@/lib/types'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('id, user_id, role, email, full_name, organization_id, is_active, created_at, updated_at')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!userRole) redirect('/login')

  // Map DB role names to app role names
  const nameParts = (userRole.full_name ?? '').split(' ')
  const profile: UserProfile = {
    id: userRole.id,
    email: userRole.email ?? user.email ?? '',
    first_name: nameParts[0] ?? '',
    last_name: nameParts.slice(1).join(' '),
    role: (userRole.role === 'organization_admin' ? 'org_admin' : userRole.role) as UserProfile['role'],
    organization_id: userRole.organization_id ?? null,
    is_active: userRole.is_active ?? true,
    created_at: userRole.created_at,
    updated_at: userRole.updated_at,
  }

  let impersonatedOrgName: string | null = null
  if (profile.role === 'super_admin' && profile.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', profile.organization_id)
      .single()
    impersonatedOrgName = org?.name ?? null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar userProfile={profile as UserProfile} />
      <div className="flex flex-1 flex-col md:pl-64">
        <TopBar
          userProfile={profile as UserProfile}
          impersonatedOrgName={impersonatedOrgName}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

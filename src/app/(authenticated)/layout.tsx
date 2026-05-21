import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/top-bar'
import type { UserProfile } from '@/lib/types'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

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

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { UserProfile } from "@/lib/types"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/top-bar"
import { FeedbackButton } from "@/components/layout/feedback-button"

export default async function AuthenticatedLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect("/login")
  }

  const { data: userProfile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", session.user.id)
    .single<UserProfile>()

  if (error || !userProfile) {
    redirect("/login")
  }

  let impersonatedOrgName: string | null = null

  if (userProfile.role === "super_admin" && userProfile.organization_id) {
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", userProfile.organization_id)
      .single<{ name: string }>()

    impersonatedOrgName = org?.name ?? null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userProfile={userProfile} />
      <div className="md:pl-64">
        <TopBar
          userProfile={userProfile}
          impersonatedOrgName={impersonatedOrgName}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <FeedbackButton />
    </div>
  )
}

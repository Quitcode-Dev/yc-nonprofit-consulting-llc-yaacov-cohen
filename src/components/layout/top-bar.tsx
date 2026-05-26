"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { UserProfile } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function roleLabel(role: UserProfile["role"]) {
  if (role === "super_admin") return "Super Admin"
  if (role === "org_admin") return "Org Admin"
  return "Solicitor"
}

export function TopBar({
  userProfile,
  impersonatedOrgName
}: {
  userProfile: UserProfile
  impersonatedOrgName: string | null
}) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isExitingImpersonation, setIsExitingImpersonation] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch {
      setIsLoggingOut(false)
    }
  }

  const handleExitImpersonation = async () => {
    setIsExitingImpersonation(true)
    try {
      const supabase = createClient()
      await supabase
        .from("user_roles")
        .update({ organization_id: null })
        .eq("id", userProfile.id)

      router.push("/organizations")
      router.refresh()
    } catch {
      setIsExitingImpersonation(false)
    }
  }

  return (
    <div className="border-b border-slate-200 bg-white">
      {userProfile.role === "super_admin" && impersonatedOrgName ? (
        <div className="flex items-center justify-between bg-yellow-200 px-4 py-2 text-sm text-yellow-900">
          <span>Viewing as: {impersonatedOrgName}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExitImpersonation}
            disabled={isExitingImpersonation}
            className="border-yellow-700 bg-yellow-100 text-yellow-900 hover:bg-yellow-50"
          >
            Exit
          </Button>
        </div>
      ) : null}

      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="md:ml-0 ml-14">
          <h1 className="text-sm font-medium text-slate-900">
            {userProfile.first_name} {userProfile.last_name}
          </h1>
          <Badge variant="secondary" className="mt-1">
            {roleLabel(userProfile.role)}
          </Badge>
        </div>

        <Button onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  )
}

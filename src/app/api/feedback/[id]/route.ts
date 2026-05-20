import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { assertRole, AuthorizationError } from "@/lib/auth/authorize"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  // 1. Authenticate & authorise
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>["profile"]

  try {
    const auth = await getAuthenticatedUser()
    profile = auth.profile
    assertRole(profile, ["super_admin"])
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  // 2. Parse body
  let body: { status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { status } = body

  const validStatuses = ["new", "reviewed", "resolved"]
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: "status must be one of: new, reviewed, resolved" },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("feedback")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

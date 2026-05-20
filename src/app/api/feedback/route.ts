import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { assertRole, AuthorizationError } from "@/lib/auth/authorize"

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || null
  const orgId = searchParams.get("org_id") || null
  const status = searchParams.get("status") || null
  const from = searchParams.get("from") || null
  const to = searchParams.get("to") || null
  const sort = searchParams.get("sort") || "desc"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const pageSize = 50
  const offset = (page - 1) * pageSize

  const supabase = await createClient()

  let query = supabase
    .from("feedback")
    .select(
      `
      id,
      category,
      title,
      description,
      status,
      attachment_url,
      created_at,
      updated_at,
      user_id,
      organization_id,
      user_profiles!feedback_user_id_fkey (
        first_name,
        last_name,
        email
      ),
      organizations!feedback_organization_id_fkey (
        name
      )
    `,
      { count: "exact" }
    )

  if (category) query = query.eq("category", category)
  if (orgId) query = query.eq("organization_id", orgId)
  if (status) query = query.eq("status", status)
  if (from) query = query.gte("created_at", from)
  if (to) {
    // include the full "to" day
    const toDate = new Date(to)
    toDate.setDate(toDate.getDate() + 1)
    query = query.lt("created_at", toDate.toISOString().slice(0, 10))
  }

  query = query
    .order("created_at", { ascending: sort === "asc" })
    .range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }

  return NextResponse.json({
    feedback: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  })
}

export async function POST(request: NextRequest) {
  // 1. Authenticate
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>["profile"]

  try {
    const auth = await getAuthenticatedUser()
    profile = auth.profile
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Parse multipart form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const category = formData.get("category") as string | null
  const title = formData.get("title") as string | null
  const description = formData.get("description") as string | null
  const attachment = formData.get("attachment") as File | null

  if (!category || !title || !description) {
    return NextResponse.json(
      { error: "category, title, and description are required" },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // 3. Optionally upload attachment
  let attachmentUrl: string | null = null

  if (attachment && attachment.size > 0) {
    const ext = attachment.name.split(".").pop() ?? "bin"
    const fileName = `${profile.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("feedback-attachments")
      .upload(fileName, attachment, {
        contentType: attachment.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to upload attachment" },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage
      .from("feedback-attachments")
      .getPublicUrl(fileName)

    attachmentUrl = urlData.publicUrl
  }

  // 4. Insert feedback record
  const { error: insertError } = await supabase.from("feedback").insert({
    user_id: profile.id,
    organization_id: profile.organization_id ?? null,
    category,
    title,
    description,
    status: "new",
    attachment_url: attachmentUrl,
  })

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true }, { status: 201 })
}

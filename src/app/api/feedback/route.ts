import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/lib/auth"

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

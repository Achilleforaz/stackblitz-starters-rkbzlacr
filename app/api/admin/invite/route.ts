import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/app/lib/supabaseAdmin"

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token)

  if (userError || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: requesterProfile } = await supabaseAdmin
    .from("admin_users")
    .select("role")
    .eq("email", user.email.toLowerCase())
    .eq("is_active", true)
    .single()

  if (requesterProfile?.role !== "superadmin") {
    return NextResponse.json(
      { error: "Only superadmin can invite admins" },
      { status: 403 }
    )
  }

  const body = await request.json()
  const email = String(body.email || "").trim().toLowerCase()

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const { error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/login`,
    })

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 400 })
  }

  const { error: insertError } = await supabaseAdmin
    .from("admin_users")
    .upsert(
      {
        email,
        role: "admin",
        is_active: true,
      },
      { onConflict: "email" }
    )

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
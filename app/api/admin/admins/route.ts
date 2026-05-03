import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/app/lib/supabaseAdmin"

async function getAdminProfile(request: Request) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.replace("Bearer ", "")

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token)

  if (!user?.email) return null

  const { data } = await supabaseAdmin
    .from("admin_users")
    .select("email, role, is_active")
    .eq("email", user.email.toLowerCase())
    .eq("is_active", true)
    .single()

  return data
}

export async function GET(request: Request) {
  const profile = await getAdminProfile(request)

  if (!profile || profile.role !== "superadmin") {
    return NextResponse.json(
      { error: "Only superadmin can view admins" },
      { status: 403 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, email, role, is_active, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ admins: data || [] })
}

export async function POST(request: Request) {
  const profile = await getAdminProfile(request)

  if (!profile || profile.role !== "superadmin") {
    return NextResponse.json(
      { error: "Only superadmin can delete admins" },
      { status: 403 }
    )
  }

  const body = await request.json()
  const email = String(body.email || "").toLowerCase().trim()

  if (body.action !== "delete_admin") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 })
  }

  if (email === profile.email.toLowerCase()) {
    return NextResponse.json(
      { error: "You cannot delete yourself" },
      { status: 400 }
    )
  }

  const { error } = await supabaseAdmin
    .from("admin_users")
    .delete()
    .eq("email", email)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/app/lib/supabaseAdmin"

export const dynamic = "force-dynamic"
export const revalidate = 0

function clean(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

function cleanEmail(value: unknown) {
  return clean(value).toLowerCase()
}

export async function GET(request: Request) {
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

  const email = cleanEmail(user.email)

  const byEmail = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .ilike("email", email)
    .limit(20)

  if (byEmail.error) {
    return NextResponse.json({ error: byEmail.error.message }, { status: 400 })
  }

  const emailMatches = byEmail.data || []
  let adminProfile =
    emailMatches.find((profile: any) => profile.is_active !== false) ||
    emailMatches[0] ||
    null

  if (!adminProfile) {
    const byAuthUserId = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("auth_user_id", user.id)
      .limit(20)

    if (byAuthUserId.error && byAuthUserId.error.code !== "42703") {
      return NextResponse.json({ error: byAuthUserId.error.message }, { status: 400 })
    }

    const authUserIdMatches = byAuthUserId.data || []
    adminProfile =
      authUserIdMatches.find((profile: any) => profile.is_active !== false) ||
      authUserIdMatches[0] ||
      null
  }

  if (!adminProfile || adminProfile.is_active === false) {
    return NextResponse.json(
      { error: "Admin profile not found", email },
      { status: 404 }
    )
  }

  const profile = {
    ...adminProfile,
    email: cleanEmail(adminProfile.email || email),
    role: adminProfile.role || "admin",
  }

  return NextResponse.json({
    profile,
    admin: profile,
    email,
    role: profile.role,
  })
}

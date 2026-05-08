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

function isOptionalActivityTableError(error: any) {
  const message = String(error?.message || error || "").toLowerCase()
  const code = String(error?.code || "").toLowerCase()

  return (
    code === "42p01" ||
    code === "42501" ||
    message.includes("permission denied") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  )
}

async function getAdminProfile(request: Request) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader?.startsWith("Bearer ")) return null

  const token = authHeader.replace("Bearer ", "")
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token)

  if (userError || !user?.email) return null

  const email = cleanEmail(user.email)

  const byEmail = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .ilike("email", email)
    .limit(20)

  if (byEmail.error) return null

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

    if (!byAuthUserId.error) {
      const authUserIdMatches = byAuthUserId.data || []
      adminProfile =
        authUserIdMatches.find((profile: any) => profile.is_active !== false) ||
        authUserIdMatches[0] ||
        null
    }
  }

  if (!adminProfile || adminProfile.is_active === false) return null

  return {
    ...adminProfile,
    email: cleanEmail(adminProfile.email || email),
    role: adminProfile.role || "admin",
  }
}

async function requireAdmin(request: Request) {
  const profile = await getAdminProfile(request)

  if (!profile) {
    return {
      profile: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { profile, error: null }
}

export async function GET(request: Request) {
  const { error } = await requireAdmin(request)
  if (error) return error

  const { data, error: activityError } = await supabaseAdmin
    .from("prism_client_activity")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000)

  if (activityError) {
    if (isOptionalActivityTableError(activityError)) {
      return NextResponse.json({
        clientActivity: [],
        activityUnavailable: true,
        warning:
          "PRISM activity tracking is not available yet. Run supabase/prism-client-activity.sql, then reload this page.",
      })
    }

    return NextResponse.json({ error: activityError.message }, { status: 400 })
  }

  const grouped = new Map<string, any>()

  for (const row of data || []) {
    const emailKey = cleanEmail(row.user_email)
    const clientId = emailKey || clean(row.client_user_id || "unknown")
    const existing = grouped.get(clientId) || {
      clientId,
      userEmail: emailKey || null,
      searchCount: 0,
      datasheets: [],
      lastActivityAt: null,
    }

    if (!existing.lastActivityAt || new Date(row.created_at) > new Date(existing.lastActivityAt)) {
      existing.lastActivityAt = row.created_at
    }

    if (row.event_type === "search") {
      existing.searchCount += 1
    }

    if (row.event_type === "datasheet") {
      existing.datasheets.push(row)
    }

    grouped.set(clientId, existing)
  }

  return NextResponse.json({ clientActivity: Array.from(grouped.values()) })
}

export async function POST(request: Request) {
  const { profile, error } = await requireAdmin(request)
  if (error) return error

  try {
    const body = await request.json()

    if (body.action !== "update_follow_up") {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }

    const activityId = clean(body.activityId)

    if (!activityId) {
      return NextResponse.json({ error: "Missing activity id" }, { status: 400 })
    }

    const followedUp = Boolean(body.followedUp)

    const { data, error: updateError } = await supabaseAdmin
      .from("prism_client_activity")
      .update({
        followed_up: followedUp,
        followed_up_at: followedUp ? new Date().toISOString() : null,
        followed_up_by: followedUp ? profile?.email || null : null,
      })
      .eq("id", activityId)
      .select("*")
      .single()

    if (updateError) {
      if (isOptionalActivityTableError(updateError)) {
        return NextResponse.json(
          {
            error:
              "PRISM activity tracking is not available yet. Run supabase/prism-client-activity.sql, then try again.",
          },
          { status: 503 }
        )
      }

      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ activity: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to update client activity" },
      { status: 500 }
    )
  }
}

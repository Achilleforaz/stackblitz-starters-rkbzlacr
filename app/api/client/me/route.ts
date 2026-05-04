import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/app/lib/supabaseAdmin"

export const dynamic = "force-dynamic"
export const revalidate = 0

function clean(value: unknown) {
  return String(value || "").trim().toLowerCase()
}

function parseBoolean(value: unknown) {
  if (value === true) return true
  if (value === false) return false
  if (value === 1) return true
  if (value === 0) return false

  const normalized = clean(value)
  return ["true", "1", "yes", "y", "on", "enabled"].includes(normalized)
}

function normalizeClient(client: any, user: any) {
  return {
    id: client?.id || user.id,
    email: clean(client?.email || user.email),
    first_name: client?.first_name || client?.firstName || "",
    last_name: client?.last_name || client?.lastName || "",
    company: client?.company || "",
    can_view_prices: parseBoolean(
      client?.can_view_prices ??
        client?.canViewPrices ??
        client?.can_view_price ??
        client?.price_enabled ??
        client?.prices_enabled
    ),
    is_distributor: parseBoolean(
      client?.is_distributor ?? client?.isDistributor ?? client?.distributor
    ),
    is_active:
      client?.is_active === false || clean(client?.is_active) === "false"
        ? false
        : true,
    profile_found: true,
  }
}

async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const token = authHeader.replace("Bearer ", "").trim()

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token)

  if (error || !user?.email) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  return { user, error: null }
}

function pickActive(rows: any[] | null | undefined) {
  if (!Array.isArray(rows) || rows.length === 0) return null
  return rows.find((row: any) => row.is_active !== false) || rows[0]
}

async function findClient(user: any) {
  const email = clean(user.email)

  const byEmail = await supabaseAdmin
    .from("client_users")
    .select("*")
    .ilike("email", email)
    .limit(20)

  if (!byEmail.error) {
    const client = pickActive(byEmail.data)
    if (client) return client
  }

  const relaxedEmail = await supabaseAdmin
    .from("client_users")
    .select("*")
    .ilike("email", `%${email}%`)
    .limit(20)

  if (!relaxedEmail.error) {
    const client =
      relaxedEmail.data?.find(
        (row: any) => clean(row.email) === email && row.is_active !== false
      ) ||
      relaxedEmail.data?.find((row: any) => row.is_active !== false) ||
      relaxedEmail.data?.[0]

    if (client) return client
  }

  const byAuthUserId = await supabaseAdmin
    .from("client_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .limit(20)

  if (!byAuthUserId.error) {
    const client = pickActive(byAuthUserId.data)
    if (client) return client
  }

  const byId = await supabaseAdmin
    .from("client_users")
    .select("*")
    .eq("id", user.id)
    .limit(20)

  if (!byId.error) {
    const client = pickActive(byId.data)
    if (client) return client
  }

  const rpc = await supabaseAdmin.rpc("admin_list_client_users")

  if (!rpc.error && Array.isArray(rpc.data)) {
    const matches = rpc.data.filter((row: any) => {
      return (
        clean(row.email) === email ||
        String(row.auth_user_id || "") === String(user.id) ||
        String(row.user_id || "") === String(user.id) ||
        String(row.id || "") === String(user.id)
      )
    })

    const client = pickActive(matches)
    if (client) return client
  }

  return null
}

async function linkClient(client: any, user: any) {
  if (!client?.id) return

  if (
    client.auth_user_id ||
    client.user_id ||
    String(client.id) === String(user.id)
  ) {
    return
  }

  await supabaseAdmin
    .from("client_users")
    .update({ auth_user_id: user.id })
    .eq("id", client.id)
}

export async function GET(request: Request) {
  const { user, error } = await getAuthUser(request)

  if (error) return error

  const client = await findClient(user)

  if (!client) {
    return NextResponse.json(
      {
        client: {
          id: user.id,
          email: clean(user.email),
          first_name: "",
          last_name: "",
          company: "",
          can_view_prices: false,
          is_distributor: false,
          is_active: true,
          profile_found: false,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    )
  }

  await linkClient(client, user)

  return NextResponse.json(
    {
      client: normalizeClient(client, user),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  )
}

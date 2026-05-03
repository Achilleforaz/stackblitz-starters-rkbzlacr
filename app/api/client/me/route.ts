import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/app/lib/supabaseAdmin"

export const dynamic = "force-dynamic"
export const revalidate = 0

function clean(value: any) {
  return String(value || "").trim().toLowerCase()
}

function parseBoolean(value: any) {
  if (value === true) return true
  if (value === false) return false
  if (value === 1) return true
  if (value === 0) return false

  const normalized = clean(value)

  return ["true", "1", "yes", "y", "on", "enabled"].includes(normalized)
}

function normalizeClient(client: any, user: any, source: string) {
  return {
    ...client,
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
    is_active: client?.is_active === false || clean(client?.is_active) === "false" ? false : true,
    auth_user_id: client?.auth_user_id || client?.user_id || user.id,
    profile_found: true,
    profile_source: source,
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

  const token = authHeader.replace("Bearer ", "")

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token)

  if (error || !user?.email) {
    return {
      user: null,
      error: NextResponse.json(
        {
          error: "Unauthorized",
          details: error?.message || null,
        },
        { status: 401 }
      ),
    }
  }

  return { user, error: null }
}

async function findClient(user: any) {
  const email = clean(user.email)

  const byEmail = await supabaseAdmin
    .from("client_users")
    .select("*")
    .ilike("email", email)
    .limit(20)

  if (byEmail.error) {
    return {
      client: null,
      source: "client_users_email_error",
      debug: byEmail.error.message,
    }
  }

  if (byEmail.data && byEmail.data.length > 0) {
    const active =
      byEmail.data.find((row: any) => row.is_active !== false) || byEmail.data[0]

    return {
      client: active,
      source: "client_users_email",
      debug: {
        matched_count: byEmail.data.length,
        matched_emails: byEmail.data.map((row: any) => row.email),
      },
    }
  }

  const relaxedEmail = await supabaseAdmin
    .from("client_users")
    .select("*")
    .ilike("email", `%${email}%`)
    .limit(20)

  if (!relaxedEmail.error && relaxedEmail.data && relaxedEmail.data.length > 0) {
    const active =
      relaxedEmail.data.find(
        (row: any) => clean(row.email) === email && row.is_active !== false
      ) ||
      relaxedEmail.data.find((row: any) => row.is_active !== false) ||
      relaxedEmail.data[0]

    return {
      client: active,
      source: "client_users_email_relaxed",
      debug: {
        matched_count: relaxedEmail.data.length,
        matched_emails: relaxedEmail.data.map((row: any) => row.email),
      },
    }
  }

  const byAuthUserId = await supabaseAdmin
    .from("client_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .limit(20)

  if (byAuthUserId.error) {
    return {
      client: null,
      source: "client_users_auth_user_id_error",
      debug: byAuthUserId.error.message,
    }
  }

  if (byAuthUserId.data && byAuthUserId.data.length > 0) {
    const active =
      byAuthUserId.data.find((row: any) => row.is_active !== false) ||
      byAuthUserId.data[0]

    return {
      client: active,
      source: "client_users_auth_user_id",
      debug: {
        matched_count: byAuthUserId.data.length,
        matched_emails: byAuthUserId.data.map((row: any) => row.email),
      },
    }
  }

  const byId = await supabaseAdmin
    .from("client_users")
    .select("*")
    .eq("id", user.id)
    .limit(20)

  if (byId.error) {
    return {
      client: null,
      source: "client_users_id_error",
      debug: byId.error.message,
    }
  }

  if (byId.data && byId.data.length > 0) {
    const active =
      byId.data.find((row: any) => row.is_active !== false) || byId.data[0]

    return {
      client: active,
      source: "client_users_id",
      debug: {
        matched_count: byId.data.length,
        matched_emails: byId.data.map((row: any) => row.email),
      },
    }
  }

  const rpc = await supabaseAdmin.rpc("admin_list_client_users")

  if (rpc.error) {
    return {
      client: null,
      source: "admin_list_client_users_error",
      debug: rpc.error.message,
    }
  }

  if (Array.isArray(rpc.data)) {
    const matches = rpc.data.filter((row: any) => {
      return (
        clean(row.email) === email ||
        String(row.auth_user_id || "") === String(user.id) ||
        String(row.user_id || "") === String(user.id) ||
        String(row.id || "") === String(user.id)
      )
    })

    if (matches.length > 0) {
      const active =
        matches.find((row: any) => row.is_active !== false) || matches[0]

      return {
        client: active,
        source: "admin_list_client_users",
        debug: {
          matched_count: matches.length,
          matched_emails: matches.map((row: any) => row.email),
        },
      }
    }

    return {
      client: null,
      source: "not_found_after_rpc",
      debug: {
        auth_email: email,
        auth_user_id: user.id,
        rpc_count: rpc.data.length,
        first_rpc_emails: rpc.data.slice(0, 10).map((row: any) => row.email),
      },
    }
  }

  return {
    client: null,
    source: "not_found",
    debug: {
      auth_email: email,
      auth_user_id: user.id,
    },
  }
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

  const result = await findClient(user)

  if (!result.client) {
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
          auth_user_id: user.id,
          profile_found: false,
          profile_source: result.source,
          profile_debug: result.debug,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    )
  }

  await linkClient(result.client, user)

  return NextResponse.json(
    {
      client: normalizeClient(result.client, user, result.source),
      debug: result.debug,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  )
}
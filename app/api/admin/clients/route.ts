import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function createUserSupabaseClient(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  const authHeader = request.headers.get("authorization") || ""

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        authorization: authHeader,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function GET(request: Request) {
  try {
    const supabase = createUserSupabaseClient(request)

    const { data, error } = await supabase.rpc("admin_list_client_users")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ clients: data || [] })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to load clients" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createUserSupabaseClient(request)
    const body = await request.json()

    if (body.action !== "update_client_access") {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }

    const id = String(body.id || "").trim()

    if (!id) {
      return NextResponse.json({ error: "Missing client id" }, { status: 400 })
    }

    const discount = Number(body.distributorDiscountPercent || 0)

    const { data, error } = await supabase.rpc("admin_update_client_access", {
      client_id: id,
      new_can_view_prices: Boolean(body.canViewPrices),
      new_is_distributor: Boolean(body.isDistributor),
      new_distributor_discount_percent: Number.isFinite(discount) ? discount : 0,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ client: data?.[0] || null })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to update client" },
      { status: 500 }
    )
  }
}
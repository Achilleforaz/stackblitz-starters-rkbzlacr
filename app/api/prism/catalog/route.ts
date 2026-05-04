import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/app/lib/supabaseAdmin"

export const dynamic = "force-dynamic"
export const revalidate = 0

type AccessContext = {
  canViewPrices: boolean
  isAdmin: boolean
  isDistributor: boolean
  email: string | null
  role: string | null
}

function clean(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

function cleanEmail(value: unknown) {
  return clean(value).toLowerCase()
}

function parseBoolean(value: unknown) {
  if (value === true) return true
  if (value === false) return false
  if (value === 1) return true
  if (value === 0) return false

  const normalized = clean(value).toLowerCase()
  return ["true", "1", "yes", "y", "on", "enabled"].includes(normalized)
}

function normalizeProduct(item: any, canViewPrices: boolean) {
  return {
    id: item.id,
    dn: clean(item.dn),
    mwp: clean(item.mwp),
    port: clean(item.port),
    model: clean(item.model),
    bodyMaterial: clean(item.body_material),
    regulation: clean(item.regulation),
    setting: clean(item.setting),
    sealing: clean(item.sealing),
    degreasing: clean(item.degreasing),
    option: clean(item.option),
    certification: clean(item.certification),
    valveInsert: clean(item.mat_valve_insert ?? item.valve_insert ?? item.material_valve_insert),
    seat: clean(item.mat_seat ?? item.seat ?? item.material_seat),
    workingTemp: clean(item.working_temp ?? item.temperature_range ?? item.working_temperature),
    leakageRate: clean(item.leakage_rate ?? item.leakage_rate_int ?? item.leakage_rate_internal),
    leakageRateInternal: clean(item.leakage_rate_int ?? item.leakage_rate_internal),
    leakageRateExternal: clean(item.leakage_rate_ext ?? item.leakage_rate_external),
    newCode: clean(item.new_code),
    price: canViewPrices ? clean(item.price) : "",
  }
}

function normalizeClient(client: any) {
  if (!client) return null

  return {
    ...client,
    email: cleanEmail(client.email),
    can_view_prices: parseBoolean(client.can_view_prices),
    is_distributor: parseBoolean(client.is_distributor),
    is_active:
      client.is_active === false || clean(client.is_active).toLowerCase() === "false"
        ? false
        : true,
  }
}

function pickActive(rows: any[] | null | undefined) {
  if (!Array.isArray(rows) || rows.length === 0) return null
  return rows.find((row: any) => row.is_active !== false) || rows[0]
}

async function getAccessContext(request: Request): Promise<AccessContext> {
  const empty: AccessContext = {
    canViewPrices: false,
    isAdmin: false,
    isDistributor: false,
    email: null,
    role: null,
  }

  const authHeader = request.headers.get("authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    return empty
  }

  const token = authHeader.replace("Bearer ", "").trim()

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token)

  if (error || !user?.email) {
    return empty
  }

  const email = cleanEmail(user.email)

  const adminResult = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .ilike("email", email)
    .limit(20)

  const adminProfile = pickActive(adminResult.data)

  if (adminProfile && adminProfile.is_active !== false) {
    return {
      canViewPrices: true,
      isAdmin: true,
      isDistributor: false,
      email,
      role: adminProfile.role || "admin",
    }
  }

  const clientResult = await supabaseAdmin
    .from("client_users")
    .select("*")
    .ilike("email", email)
    .limit(20)

  const clientProfile = normalizeClient(pickActive(clientResult.data))

  if (!clientProfile || clientProfile.is_active === false) {
    return empty
  }

  const isDistributor = parseBoolean(clientProfile.is_distributor)
  const canViewPrices = parseBoolean(clientProfile.can_view_prices) || isDistributor

  return {
    canViewPrices,
    isAdmin: false,
    isDistributor,
    email,
    role: null,
  }
}

async function getDistributorDiscounts(canViewPrices: boolean) {
  if (!canViewPrices) return {}

  const [settingsResult, rangesResult] = await Promise.all([
    supabaseAdmin.from("product_distributor_discount_settings").select("*"),
    supabaseAdmin
      .from("product_distributor_discount_ranges")
      .select("*")
      .order("min_volume"),
  ])

  const settings = settingsResult.data || []
  const ranges = rangesResult.data || []

  const map: Record<number, any> = {}

  settings.forEach((item: any) => {
    map[Number(item.product_id)] = {
      defaultDiscount: Number(
        item.base_discount_percent ??
          item.default_discount_percent ??
          item.default_distributor_discount_percent ??
          item.discount_percent ??
          0
      ),
      ranges: [],
    }
  })

  ranges.forEach((range: any) => {
    const productId = Number(range.product_id)

    if (!map[productId]) {
      map[productId] = {
        defaultDiscount: 0,
        ranges: [],
      }
    }

    map[productId].ranges.push({
      id: range.id,
      product_id: productId,
      min_volume: Number(range.min_volume),
      max_volume: range.max_volume === null ? null : Number(range.max_volume),
      discount_percent: Number(range.discount_percent || 0),
    })
  })

  return map
}

export async function GET(request: Request) {
  const accessContext = await getAccessContext(request)

  const [{ data, error }, distributorDiscounts] = await Promise.all([
    supabaseAdmin
      .from("prism_configurations")
      .select("*")
      .eq("is_hidden", false)
      .order("model"),
    getDistributorDiscounts(accessContext.canViewPrices),
  ])

  if (error) {
    return NextResponse.json(
      { error: "Unable to load catalog" },
      { status: 400 }
    )
  }

  return NextResponse.json(
    {
      products: (data || []).map((item) =>
        normalizeProduct(item, accessContext.canViewPrices)
      ),
      distributorDiscounts,
      access: {
        canViewPrices: accessContext.canViewPrices,
        isAdmin: accessContext.isAdmin,
        isDistributor: accessContext.isDistributor,
        email: accessContext.email,
        role: accessContext.role,
      },
      canViewPrices: accessContext.canViewPrices,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  )
}

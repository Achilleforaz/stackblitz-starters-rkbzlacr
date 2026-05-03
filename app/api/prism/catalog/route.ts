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
  client: any | null
  admin: any | null
  debug: Record<string, any>
}

type DistributorDiscountSettings = {
  id: string
  product_id: number
  base_discount_percent?: number | null
  default_discount_percent?: number | null
  default_distributor_discount_percent?: number | null
  discount_percent?: number | null
}

type DistributorDiscountRange = {
  id: string
  product_id: number
  min_volume: number
  max_volume: number | null
  discount_percent: number
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
    newCode: clean(item.new_code),
    price: canViewPrices ? clean(item.price) : "",
  }
}

function normalizeClient(client: any) {
  if (!client) return null

  return {
    ...client,
    email: cleanEmail(client.email),
    can_view_prices: parseBoolean(
      client.can_view_prices ??
        client.canViewPrices ??
        client.can_view_price ??
        client.price_enabled ??
        client.prices_enabled
    ),
    is_distributor: parseBoolean(
      client.is_distributor ?? client.isDistributor ?? client.distributor
    ),
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

async function findActiveAdmin(email: string, debug: Record<string, any>) {
  const adminExact = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .ilike("email", email)
    .limit(20)

  debug.adminExactError = adminExact.error?.message || null
  debug.adminExactCount = adminExact.data?.length || 0

  return pickActive(adminExact.data)
}

async function findActiveClient(user: any, debug: Record<string, any>) {
  const email = cleanEmail(user.email)
  const userId = String(user.id || "")

  debug.authUserId = userId
  debug.authEmail = email

  const exact = await supabaseAdmin
    .from("client_users")
    .select("*")
    .ilike("email", email)
    .limit(20)

  debug.clientExactError = exact.error?.message || null
  debug.clientExactCount = exact.data?.length || 0

  const exactPick = pickActive(exact.data)
  if (exactPick) return exactPick

  const contains = await supabaseAdmin
    .from("client_users")
    .select("*")
    .ilike("email", `%${email}%`)
    .limit(20)

  debug.clientContainsError = contains.error?.message || null
  debug.clientContainsCount = contains.data?.length || 0

  const containsPick = pickActive(contains.data)
  if (containsPick) return containsPick

  const allClients = await supabaseAdmin
    .from("client_users")
    .select("*")
    .range(0, 4999)

  debug.clientAllError = allClients.error?.message || null
  debug.clientAllCount = allClients.data?.length || 0
  debug.clientSampleEmails = Array.isArray(allClients.data)
    ? allClients.data.slice(0, 20).map((row: any) => clean(row.email))
    : []

  if (Array.isArray(allClients.data)) {
    const matches = allClients.data.filter((row: any) => {
      return (
        cleanEmail(row.email) === email ||
        String(row.auth_user_id || "") === userId ||
        String(row.user_id || "") === userId ||
        String(row.id || "") === userId
      )
    })

    debug.clientJsMatchCount = matches.length

    const jsPick = pickActive(matches)
    if (jsPick) return jsPick
  }

  return null
}

async function getAccessContext(request: Request): Promise<AccessContext> {
  const empty: AccessContext = {
    canViewPrices: false,
    isAdmin: false,
    isDistributor: false,
    email: null,
    role: null,
    client: null,
    admin: null,
    debug: {},
  }

  const authHeader = request.headers.get("authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ...empty,
      debug: {
        reason: "missing_authorization_header",
      },
    }
  }

  const token = authHeader.replace("Bearer ", "").trim()

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token)

  if (userError || !user?.email) {
    return {
      ...empty,
      debug: {
        reason: "invalid_token_or_no_email",
        userError: userError?.message || null,
      },
    }
  }

  const email = cleanEmail(user.email)
  const debug: Record<string, any> = {
    authEmail: email,
  }

  const adminProfile = await findActiveAdmin(email, debug)

  if (adminProfile && adminProfile.is_active !== false) {
    return {
      canViewPrices: true,
      isAdmin: true,
      isDistributor: false,
      email,
      role: adminProfile.role || "admin",
      client: null,
      admin: adminProfile,
      debug,
    }
  }

  const rawClientProfile = await findActiveClient(user, debug)
  const clientProfile = normalizeClient(rawClientProfile)

  debug.clientFound = Boolean(clientProfile)

  if (clientProfile) {
    debug.clientId = clientProfile.id || null
    debug.clientEmail = clientProfile.email || null
    debug.clientCanViewPrices = clientProfile.can_view_prices
    debug.clientIsDistributor = clientProfile.is_distributor
    debug.clientIsActive = clientProfile.is_active
  }

  if (!clientProfile || clientProfile.is_active === false) {
    return { ...empty, email, debug }
  }

  const isDistributor = parseBoolean(clientProfile.is_distributor)
  const canViewPrices = parseBoolean(clientProfile.can_view_prices) || isDistributor

  return {
    canViewPrices,
    isAdmin: false,
    isDistributor,
    email,
    role: null,
    client: clientProfile,
    admin: null,
    debug,
  }
}

async function getDistributorDiscounts() {
  const [settingsResult, rangesResult] = await Promise.all([
    supabaseAdmin.from("product_distributor_discount_settings").select("*"),
    supabaseAdmin
      .from("product_distributor_discount_ranges")
      .select("*")
      .order("min_volume"),
  ])

  const settings = (settingsResult.data || []) as DistributorDiscountSettings[]
  const ranges = (rangesResult.data || []) as DistributorDiscountRange[]
  const map: Record<
    number,
    { defaultDiscount: number; ranges: DistributorDiscountRange[] }
  > = {}

  settings.forEach((item) => {
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

  ranges.forEach((range) => {
    const productId = Number(range.product_id)

    if (!map[productId]) {
      map[productId] = {
        defaultDiscount: 0,
        ranges: [],
      }
    }

    map[productId].ranges.push({
      ...range,
      product_id: productId,
      min_volume: Number(range.min_volume),
      max_volume: range.max_volume === null ? null : Number(range.max_volume),
      discount_percent: Number(range.discount_percent || 0),
    })
  })

  Object.keys(map).forEach((productId) => {
    map[Number(productId)].ranges.sort(
      (a, b) => Number(a.min_volume) - Number(b.min_volume)
    )
  })

  return map
}

export async function GET(request: Request) {
  const accessContext = await getAccessContext(request)

  console.log("PRISM ACCESS DEBUG", JSON.stringify({
    email: accessContext.email,
    canViewPrices: accessContext.canViewPrices,
    isAdmin: accessContext.isAdmin,
    isDistributor: accessContext.isDistributor,
    clientFound: Boolean(accessContext.client),
    adminFound: Boolean(accessContext.admin),
    debug: accessContext.debug,
  }, null, 2))

  const [{ data, error }, distributorDiscounts] = await Promise.all([
    supabaseAdmin
      .from("prism_configurations")
      .select("*")
      .eq("is_hidden", false)
      .order("model"),
    getDistributorDiscounts(),
  ])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
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
        debug: accessContext.debug,
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

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
    error: userError,
  } = await supabaseAdmin.auth.getUser(token)

  if (userError || !user?.email) return null

  const { data: profile } = await supabaseAdmin
    .from("admin_users")
    .select("email, role, is_active")
    .eq("email", user.email.toLowerCase().trim())
    .eq("is_active", true)
    .single()

  return profile
}

async function requireAdmin(request: Request) {
  const profile = await getAdminProfile(request)

  if (!profile) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { error: null }
}

function normalizeSettings(settings: any) {
  if (!settings) return null

  return {
    ...settings,
    base_discount_percent:
      settings.base_discount_percent ??
      settings.default_discount_percent ??
      settings.default_distributor_discount_percent ??
      settings.discount_percent ??
      0,
  }
}

async function loadProducts() {
  const { data, error } = await supabaseAdmin
    .from("prism_configurations")
    .select("*")
    .order("category")
    .order("model_code")
    .order("new_code")

  if (error) throw new Error(error.message)

  return data || []
}

async function loadDiscountSettings(productId: number) {
  const { data, error } = await supabaseAdmin
    .from("product_distributor_discount_settings")
    .select("*")
    .eq("product_id", productId)
    .maybeSingle()

  if (error) throw new Error(error.message)

  return normalizeSettings(data)
}

async function loadDiscountRanges(productId: number) {
  const { data, error } = await supabaseAdmin
    .from("product_distributor_discount_ranges")
    .select("*")
    .eq("product_id", productId)
    .order("min_volume")

  if (error) throw new Error(error.message)

  return data || []
}

async function loadModelProductIds(category: string, modelCode: string) {
  const { data, error } = await supabaseAdmin
    .from("prism_configurations")
    .select("id")
    .eq("category", category)
    .eq("model_code", modelCode)

  if (error) throw new Error(error.message)

  return (data || [])
    .map((product: any) => Number(product.id))
    .filter((id: number) => Number.isFinite(id))
}

async function saveSettingsWithKnownColumn(
  productId: number,
  value: number,
  existingSettings: any
) {
  const possibleColumns = [
    "base_discount_percent",
    "default_discount_percent",
    "default_distributor_discount_percent",
    "discount_percent",
  ]

  let lastError: any = null

  for (const column of possibleColumns) {
    if (existingSettings?.id) {
      const { data, error } = await supabaseAdmin
        .from("product_distributor_discount_settings")
        .update({
          [column]: value,
        })
        .eq("id", existingSettings.id)
        .select("*")
        .single()

      if (!error) return normalizeSettings(data)

      lastError = error
    } else {
      const { data, error } = await supabaseAdmin
        .from("product_distributor_discount_settings")
        .insert({
          product_id: productId,
          [column]: value,
        })
        .select("*")
        .single()

      if (!error) return normalizeSettings(data)

      lastError = error
    }
  }

  throw new Error(
    lastError?.message ||
      "Unable to save default distributor discount. Check discount settings column name."
  )
}

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    const products = await loadProducts()

    if (!productId) {
      return NextResponse.json({
        products,
        settings: null,
        ranges: [],
      })
    }

    const numericProductId = Number(productId)

    if (!Number.isFinite(numericProductId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 })
    }

    const settings = await loadDiscountSettings(numericProductId)
    const ranges = await loadDiscountRanges(numericProductId)

    return NextResponse.json({
      products,
      settings,
      ranges,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to load distributor discounts" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error

    const body = await request.json()

    if (body.action === "save_base_discount") {
      const productId = Number(body.productId)
      const baseDiscountPercent = Number(body.baseDiscountPercent || 0)

      if (!Number.isFinite(productId)) {
        return NextResponse.json({ error: "Invalid product id" }, { status: 400 })
      }

      const existingSettings = await loadDiscountSettings(productId)
      const settings = await saveSettingsWithKnownColumn(
        productId,
        baseDiscountPercent,
        existingSettings
      )

      return NextResponse.json({ settings })
    }


    if (body.action === "save_model_base_discount") {
      const category = String(body.category || "Pressure Regulator").trim()
      const modelCode = String(body.modelCode || "").trim()
      const baseDiscountPercent = Number(body.baseDiscountPercent || 0)

      if (!modelCode) {
        return NextResponse.json({ error: "Missing model code" }, { status: 400 })
      }

      const productIds = await loadModelProductIds(category, modelCode)

      for (const productId of productIds) {
        const existingSettings = await loadDiscountSettings(productId)
        await saveSettingsWithKnownColumn(
          productId,
          baseDiscountPercent,
          existingSettings
        )
      }

      return NextResponse.json({ updatedCount: productIds.length })
    }

    if (body.action === "replace_model_ranges") {
      const category = String(body.category || "Pressure Regulator").trim()
      const modelCode = String(body.modelCode || "").trim()
      const ranges = Array.isArray(body.ranges) ? body.ranges : []

      if (!modelCode) {
        return NextResponse.json({ error: "Missing model code" }, { status: 400 })
      }

      const productIds = await loadModelProductIds(category, modelCode)

      if (productIds.length) {
        const deleteExisting = await supabaseAdmin
          .from("product_distributor_discount_ranges")
          .delete()
          .in("product_id", productIds)

        if (deleteExisting.error) {
          return NextResponse.json({ error: deleteExisting.error.message }, { status: 400 })
        }
      }

      const rows = productIds.flatMap((productId) =>
        ranges.map((range: any) => ({
          product_id: productId,
          min_volume: Number(range.minVolume || 1),
          max_volume:
            range.maxVolume === null || range.maxVolume === ""
              ? null
              : Number(range.maxVolume),
          discount_percent: Number(range.discountPercent || 0),
        }))
      )

      if (rows.length) {
        const { error } = await supabaseAdmin
          .from("product_distributor_discount_ranges")
          .insert(rows)

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
      }

      return NextResponse.json({ updatedCount: productIds.length })
    }

    if (body.action === "add_range") {
      const productId = Number(body.productId)
      const minVolume = Number(body.minVolume || 1)
      const maxVolume =
        body.maxVolume === null || body.maxVolume === ""
          ? null
          : Number(body.maxVolume)
      const discountPercent = Number(body.discountPercent || 0)

      if (!Number.isFinite(productId)) {
        return NextResponse.json({ error: "Invalid product id" }, { status: 400 })
      }

      const { data, error } = await supabaseAdmin
        .from("product_distributor_discount_ranges")
        .insert({
          product_id: productId,
          min_volume: minVolume,
          max_volume: maxVolume,
          discount_percent: discountPercent,
        })
        .select("*")
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ range: data })
    }

    if (body.action === "update_range") {
      const maxVolume =
        body.maxVolume === null || body.maxVolume === ""
          ? null
          : Number(body.maxVolume)

      const { data, error } = await supabaseAdmin
        .from("product_distributor_discount_ranges")
        .update({
          min_volume: Number(body.minVolume || 1),
          max_volume: maxVolume,
          discount_percent: Number(body.discountPercent || 0),
        })
        .eq("id", body.id)
        .select("*")
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ range: data })
    }

    if (body.action === "delete_range") {
      const { error } = await supabaseAdmin
        .from("product_distributor_discount_ranges")
        .delete()
        .eq("id", body.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to update distributor discounts" },
      { status: 500 }
    )
  }
}

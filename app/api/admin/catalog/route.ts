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

  const { data: products, error: productsError } = await supabaseAdmin
    .from("prism_configurations")
    .select("*")
    .order("category")
    .order("model_code")
    .order("new_code")

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 400 })
  }

  const { data: categories, error: categoriesError } = await supabaseAdmin
    .from("prism_categories")
    .select("*")
    .order("sort_order")
    .order("name")

  if (categoriesError) {
    return NextResponse.json({ error: categoriesError.message }, { status: 400 })
  }

  return NextResponse.json({
    products: products || [],
    categories: categories || [],
  })
}

export async function POST(request: Request) {
  const { profile, error } = await requireAdmin(request)
  if (error) return error

  const body = await request.json()
  const action = body.action

  if (action === "create_category") {
    const name = String(body.name || "").trim()
    const code = String(body.code || "").trim()

    if (!name || !code) {
      return NextResponse.json({ error: "Missing category name or code" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("prism_categories")
      .insert({
        name,
        code,
        is_hidden: false,
      })
      .select("*")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ category: data })
  }

  if (action === "update_category") {
    const oldCategory = await supabaseAdmin
      .from("prism_categories")
      .select("*")
      .eq("id", body.id)
      .single()

    if (oldCategory.error || !oldCategory.data) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from("prism_categories")
      .update({
        name: body.name,
        code: body.code,
        is_hidden: body.is_hidden,
      })
      .eq("id", body.id)
      .select("*")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    if (oldCategory.data.name !== data.name) {
      const updateProducts = await supabaseAdmin
        .from("prism_configurations")
        .update({ category: data.name })
        .eq("category", oldCategory.data.name)

      if (updateProducts.error) {
        return NextResponse.json({ error: updateProducts.error.message }, { status: 400 })
      }
    }

    return NextResponse.json({ category: data })
  }

  if (action === "delete_category") {
    if (profile?.role !== "superadmin") {
      return NextResponse.json({ error: "Only superadmin can delete categories" }, { status: 403 })
    }

    const { data: category } = await supabaseAdmin
      .from("prism_categories")
      .select("*")
      .eq("id", body.id)
      .single()

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const { count, error: countError } = await supabaseAdmin
      .from("prism_configurations")
      .select("id", { count: "exact", head: true })
      .eq("category", category.name)

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 })
    }

    if ((count || 0) > 0) {
      return NextResponse.json(
        { error: `Category "${category.name}" contains ${count} product(s). Move or delete them first.` },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from("prism_categories")
      .delete()
      .eq("id", body.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  }

  if (action === "create_product") {
    const payload = body.product || {}

    const { data, error } = await supabaseAdmin
      .from("prism_configurations")
      .insert({
        category: payload.category || "Pressure Regulator",
        model_code: payload.model_code || "",
        new_code: payload.new_code || "",
        dn: payload.dn || "",
        mwp: payload.mwp || "",
        port: payload.port || "",
        setting: payload.setting || "",
        model: payload.model || "",
        body_material: payload.body_material || "",
        regulation: payload.regulation || "",
        sealing: payload.sealing || "",
        degreasing: payload.degreasing || "",
        option: payload.option || "",
        price: payload.price || "",
        is_hidden: false,
      })
      .select("*")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ product: data })
  }

  if (action === "update_product") {
    const payload = body.product || {}

    const { data, error } = await supabaseAdmin
      .from("prism_configurations")
      .update({
        category: payload.category,
        model_code: payload.model_code,
        new_code: payload.new_code,
        dn: payload.dn,
        mwp: payload.mwp,
        port: payload.port,
        setting: payload.setting,
        model: payload.model,
        body_material: payload.body_material,
        regulation: payload.regulation,
        sealing: payload.sealing,
        degreasing: payload.degreasing,
        option: payload.option,
        price: payload.price || "",
        is_hidden: payload.is_hidden,
      })
      .eq("id", payload.id)
      .select("*")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ product: data })
  }


  if (action === "update_model_price") {
    const category = String(body.category || "Pressure Regulator").trim()
    const modelCode = String(body.modelCode || "").trim()
    const price = String(body.price || "").trim()

    if (!modelCode) {
      return NextResponse.json({ error: "Missing model code" }, { status: 400 })
    }

    if (!price) {
      return NextResponse.json({ error: "Missing model price" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("prism_configurations")
      .update({ price })
      .eq("category", category)
      .eq("model_code", modelCode)
      .select("*")

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ products: data || [] })
  }

  if (action === "delete_product") {
    if (profile?.role !== "superadmin") {
      return NextResponse.json({ error: "Only superadmin can delete products" }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from("prism_configurations")
      .delete()
      .eq("id", body.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}

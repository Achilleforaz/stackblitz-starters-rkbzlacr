import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/app/lib/supabaseAdmin"

export const dynamic = "force-dynamic"
export const revalidate = 0

type ActivityEventType = "search" | "datasheet"

function clean(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

function cleanEmail(value: unknown) {
  return clean(value).toLowerCase()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
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

async function getClientProfile(request: Request) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader?.startsWith("Bearer ")) return null

  const token = authHeader.replace("Bearer ", "")
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token)

  if (userError || !user?.email) return null

  const email = cleanEmail(user.email)

  const { data, error } = await supabaseAdmin
    .from("client_users")
    .select("*")
    .or(`email.ilike.${email},auth_user_id.eq.${user.id},user_id.eq.${user.id},id.eq.${user.id}`)
    .limit(20)

  if (error) return null

  const matches = data || []
  const active = matches.find((client: any) => client.is_active !== false) || matches[0] || null

  if (!active || active.is_active === false) return null

  return {
    ...active,
    id: clean(active.id || user.id),
    email: cleanEmail(active.email || email),
    first_name: clean(active.first_name),
    last_name: clean(active.last_name),
    company: clean(active.company),
  }
}

function normalizeEventType(value: unknown): ActivityEventType | null {
  const eventType = clean(value).toLowerCase()
  if (eventType === "search" || eventType === "datasheet") return eventType
  return null
}

export async function POST(request: Request) {
  try {
    const client = await getClientProfile(request)

    if (!client) {
      return NextResponse.json({ skipped: true, reason: "No active client profile" })
    }

    const body = await request.json()
    const eventType = normalizeEventType(body.eventType)

    if (!eventType) {
      return NextResponse.json({ error: "Invalid activity event type" }, { status: 400 })
    }

    const product = isRecord(body.product) ? body.product : {}
    const productCode = clean(product.code || product.newCode || body.productCode)
    const downloaded = Boolean(body.pdfDownloaded)

    const basePayload = {
      client_user_id: client.id,
      user_email: client.email,
      user_name: [client.first_name, client.last_name].filter(Boolean).join(" ").trim(),
      company: client.company,
      event_type: eventType,
      selected_fluid: clean(body.selectedFluid),
      product_code: productCode || null,
      product_model: clean(product.model) || null,
      product_snapshot: isRecord(product) ? product : {},
      conditions: Array.isArray(body.conditions) ? body.conditions : [],
      sizing_summary: isRecord(body.sizingSummary) ? body.sizingSummary : {},
      matching_products_count: Number.isFinite(Number(body.matchingProductsCount))
        ? Number(body.matchingProductsCount)
        : null,
      pdf_downloaded: downloaded,
    }

    if (eventType === "datasheet" && downloaded && productCode) {
      const since = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      const existing = await supabaseAdmin
        .from("prism_client_activity")
        .select("id")
        .eq("client_user_id", client.id)
        .eq("event_type", "datasheet")
        .eq("product_code", productCode)
        .eq("pdf_downloaded", false)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1)

      if (!existing.error && existing.data?.[0]?.id) {
        const { data, error } = await supabaseAdmin
          .from("prism_client_activity")
          .update({
            ...basePayload,
            pdf_downloaded: true,
          })
          .eq("id", existing.data[0].id)
          .select("*")
          .single()

        if (error) {
          if (isOptionalActivityTableError(error)) {
            return NextResponse.json({ skipped: true, reason: "PRISM activity table unavailable" })
          }

          return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ activity: data })
      }
    }

    const { data, error } = await supabaseAdmin
      .from("prism_client_activity")
      .insert(basePayload)
      .select("*")
      .single()

    if (error) {
      if (isOptionalActivityTableError(error)) {
        return NextResponse.json({ skipped: true, reason: "PRISM activity table unavailable" })
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ activity: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to record PRISM activity" },
      { status: 500 }
    )
  }
}

"use client"

import { Fragment, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/app/lib/supabase"

type ClientDatasheetActivity = {
  id: string
  created_at: string
  user_email?: string | null
  client_user_id?: string | null
  event_type?: string | null
  selected_fluid?: string | null
  product_code?: string | null
  product_model?: string | null
  product_snapshot?: Record<string, any> | null
  conditions?: Array<Record<string, any>> | null
  sizing_summary?: Record<string, any> | null
  matching_products_count?: number | null
  pdf_downloaded?: boolean
  followed_up?: boolean
  followed_up_at?: string | null
  followed_up_by?: string | null
}

type ClientActivitySummary = {
  clientId: string
  userEmail?: string | null
  searchCount: number
  datasheets: ClientDatasheetActivity[]
  lastActivityAt?: string | null
}

type ClientUser = {
  id: string
  first_name: string
  last_name: string
  company: string
  email: string
  can_view_prices: boolean
  is_distributor: boolean
  distributor_discount_percent?: number
  is_active: boolean
  created_at: string
  search_count?: number
  last_activity_at?: string | null
  datasheets?: ClientDatasheetActivity[]
}

function formatDateTime(value?: string | null) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatNumber(value: unknown, suffix = "") {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return "-"
  return `${Math.round(numeric * 10) / 10}${suffix}`
}

function formatCondition(condition: Record<string, any>) {
  const id = condition.id ? `C${condition.id}` : "Condition"
  const inlet = formatNumber(condition.inletPressure, " bar")
  const outlet = formatNumber(condition.outletPressure, " bar")
  const flow = condition.flowNm3h
    ? formatNumber(condition.flowNm3h, " Nm³/h")
    : formatNumber(condition.flowRateGs, " g/s")
  const temperature = formatNumber(condition.temperature, " °C")
  const utilization = condition.utilizationPercent
    ? ` · Util. ${formatNumber(condition.utilizationPercent, "%")}`
    : ""

  return `${id}: ${inlet} → ${outlet} · ${flow} · ${temperature}${utilization}`
}

function mergeClientsWithActivity(
  clients: ClientUser[],
  activitySummaries: ClientActivitySummary[]
) {
  const byClientId = new Map<string, ClientActivitySummary>()

  activitySummaries.forEach((summary) => {
    byClientId.set(String(summary.clientId), summary)

    const firstDatasheet = summary.datasheets?.[0]
    const email = String(summary.userEmail || firstDatasheet?.user_email || "").toLowerCase().trim()
    if (email) byClientId.set(email, summary)
  })

  return clients.map((client) => {
    const emailKey = String(client.email || "").toLowerCase().trim()
    const summary = byClientId.get(String(client.id)) || byClientId.get(emailKey)

    return {
      ...client,
      search_count: summary?.searchCount || 0,
      last_activity_at: summary?.lastActivityAt || null,
      datasheets: summary?.datasheets || [],
    }
  })
}

export default function AdminClientsPage() {
  const router = useRouter()

  const [clients, setClients] = useState<ClientUser[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "warning" | "info">("info")
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savingActivityId, setSavingActivityId] = useState<string | null>(null)
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null)

  useEffect(() => {
    loadClients()
  }, [])

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.access_token || null
  }

  async function loadClients() {
    setMessage("")
    setMessageType("info")
    setLoading(true)

    const token = await getAccessToken()

    if (!token) {
      router.push("/admin/login")
      return
    }

    const clientsResponse = await fetch("/api/admin/clients", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    const result = await clientsResponse.json().catch(() => ({}))

    if (!clientsResponse.ok) {
      setLoading(false)
      setMessageType("error")
      setMessage(result.error || "Unable to load clients")
      return
    }

    let activitySummaries: ClientActivitySummary[] = []

    try {
      const activityResponse = await fetch("/api/admin/client-activity", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      const activityResult = await activityResponse.json().catch(() => ({ clientActivity: [] }))

      if (activityResponse.ok) {
        activitySummaries = activityResult.clientActivity || []
      }
    } catch {
      activitySummaries = []
    }

    setClients(mergeClientsWithActivity(result.clients || [], activitySummaries))
    setLoading(false)
  }

  async function updateClientAccess(updatedClient: ClientUser) {
    setMessage("")
    setMessageType("info")
    setSavingId(updatedClient.id)

    const token = await getAccessToken()

    if (!token) {
      router.push("/admin/login")
      return
    }

    const response = await fetch("/api/admin/clients", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: "update_client_access",
        id: updatedClient.id,
        canViewPrices: updatedClient.can_view_prices,
        isDistributor: updatedClient.is_distributor,
        distributorDiscountPercent: 0,
      }),
    })

    const result = await response.json()
    setSavingId(null)

    if (!response.ok) {
      setMessageType("error")
      setMessage(result.error || "Unable to update client")
      return
    }

    setClients((current) =>
      current.map((item) => {
        if (item.id !== result.client.id) return item

        return {
          ...result.client,
          search_count: item.search_count,
          last_activity_at: item.last_activity_at,
          datasheets: item.datasheets,
        }
      })
    )
  }

  async function updateDatasheetFollowUp(activityId: string, followedUp: boolean) {
    setMessage("")
    setMessageType("info")
    setSavingActivityId(activityId)

    const token = await getAccessToken()

    if (!token) {
      router.push("/admin/login")
      return
    }

    const response = await fetch("/api/admin/client-activity", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: "update_follow_up",
        activityId,
        followedUp,
      }),
    })

    const result = await response.json()
    setSavingActivityId(null)

    if (!response.ok) {
      setMessageType("error")
      setMessage(result.error || "Unable to update follow-up status")
      return
    }

    setClients((current) =>
      current.map((client) => ({
        ...client,
        datasheets: (client.datasheets || []).map((datasheet) =>
          datasheet.id === result.activity.id ? result.activity : datasheet
        ),
      }))
    )
  }

  function togglePriceAccess(client: ClientUser) {
    updateClientAccess({
      ...client,
      can_view_prices: !client.can_view_prices,
    })
  }

  function toggleDistributor(client: ClientUser) {
    updateClientAccess({
      ...client,
      is_distributor: !client.is_distributor,
      distributor_discount_percent: 0,
    })
  }

  function toggleClientDetails(clientId: string) {
    setExpandedClientId((current) => (current === clientId ? null : clientId))
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <main className="admin-page min-h-screen p-4 text-white md:p-6">
      <div className="admin-shell mx-auto max-w-[1800px]">
        <header className="admin-header admin-header-compact admin-header-horizontal mb-6">
          <div className="admin-header-layout">
            <div className="admin-header-title">
              <p className="admin-kicker">IMF</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Client access</h1>
              <p className="mt-2 text-sm font-semibold text-white/60">
                Manage PRISM client accounts, price visibility, distributor status, and commercial follow-up.
              </p>
            </div>

            <nav className="admin-nav-row" aria-label="Admin navigation">
              <a href="/prism" className="admin-nav-button admin-nav-button-muted">
                Open PRISM
              </a>
              <a href="/admin" className="admin-nav-button admin-nav-button-muted">
                Catalog
              </a>
              <a href="/admin/clients" className="admin-nav-button admin-nav-button-active">
                Clients
              </a>
              <a href="/admin/distributor-discounts" className="admin-nav-button admin-nav-button-muted">
                Discounts
              </a>
              <a href="/admin/admins" className="admin-nav-button admin-nav-button-muted">
                Admin users
              </a>
              <button onClick={logout} className="admin-nav-button admin-nav-button-logout">
                Logout
              </button>
            </nav>
          </div>
        </header>

        {message && (
          <div
            className={
              messageType === "error"
                ? "admin-alert admin-alert-error mb-6"
                : "mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300/30 bg-amber-500/10 p-4 text-sm font-bold text-amber-100"
            }
          >
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              className="admin-small-button admin-small-button-danger"
            >
              Close
            </button>
          </div>
        )}

        <section className="admin-panel p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">Clients</h2>
              <p className="mt-1 text-sm text-gray-300">
                Search count is displayed by default. Click a client to view datasheets, working conditions, viewed products, PDF download status, and follow-up status.
              </p>
            </div>

            <button
              onClick={loadClients}
              className="admin-action-button admin-action-button-muted"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-gray-300">Loading clients...</p>
          ) : clients.length === 0 ? (
            <p className="text-gray-300">No client account yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-300">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Searches</th>
                    <th className="p-3">Datasheets</th>
                    <th className="p-3">Price access</th>
                    <th className="p-3">Client type</th>
                    <th className="p-3">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {clients.map((client) => {
                    const isExpanded = expandedClientId === client.id
                    const datasheets = client.datasheets || []

                    return (
                      <Fragment key={client.id}>
                        <tr className="border-t border-white/10">
                          <td className="p-3 font-bold">
                            <button
                              type="button"
                              onClick={() => toggleClientDetails(client.id)}
                              className="text-left font-black text-white underline-offset-4 hover:underline"
                            >
                              {client.first_name} {client.last_name}
                            </button>
                            <p className="mt-1 text-xs font-semibold text-white/45">
                              {isExpanded ? "Hide activity" : "View activity"}
                            </p>
                          </td>

                          <td className="p-3">{client.company}</td>

                          <td className="p-3">{client.email}</td>

                          <td className="p-3">
                            <span className="inline-flex min-w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-black">
                              {client.search_count || 0}
                            </span>
                            <p className="mt-1 text-xs text-white/45">
                              Last: {formatDateTime(client.last_activity_at)}
                            </p>
                          </td>

                          <td className="p-3">
                            <span className="inline-flex min-w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-black">
                              {datasheets.length}
                            </span>
                          </td>

                          <td className="p-3">
                            <button
                              onClick={() => togglePriceAccess(client)}
                              disabled={savingId === client.id}
                              className={
                                client.can_view_prices
                                  ? "rounded-xl border border-green-300 px-4 py-2 text-sm font-bold text-green-200 hover:bg-green-500/20 disabled:opacity-50"
                                  : "rounded-xl border border-red-300 px-4 py-2 text-sm font-bold text-red-200 hover:bg-red-500/20 disabled:opacity-50"
                              }
                            >
                              {client.can_view_prices ? "Prices enabled" : "Prices disabled"}
                            </button>
                          </td>

                          <td className="p-3">
                            <button
                              onClick={() => toggleDistributor(client)}
                              disabled={savingId === client.id}
                              className={
                                client.is_distributor
                                  ? "rounded-xl border border-purple-300 px-4 py-2 text-sm font-bold text-purple-200 hover:bg-purple-500/20 disabled:opacity-50"
                                  : "rounded-xl border border-gray-400 px-4 py-2 text-sm font-bold text-gray-200 hover:bg-white/10 disabled:opacity-50"
                              }
                            >
                              {client.is_distributor ? "Distributor" : "Normal client"}
                            </button>
                          </td>

                          <td className="p-3">
                            {client.created_at
                              ? new Date(client.created_at).toLocaleDateString("fr-FR")
                              : "-"}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr key={`${client.id}-details`} className="border-t border-white/10 bg-white/[0.035]">
                            <td colSpan={8} className="p-4">
                              <div className="rounded-2xl border border-white/10 bg-[#10112b]/80 p-4">
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <h3 className="text-lg font-black">PRISM client activity</h3>
                                    <p className="mt-1 text-xs text-gray-300">
                                      Commercial tracking for viewed datasheets and downloaded PDFs.
                                    </p>
                                  </div>
                                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-white/70">
                                    {client.search_count || 0} searches · {datasheets.length} datasheets
                                  </span>
                                </div>

                                {datasheets.length === 0 ? (
                                  <p className="text-sm text-gray-300">No datasheet viewed yet.</p>
                                ) : (
                                  <div className="space-y-3">
                                    {datasheets.map((datasheet) => {
                                      const conditions = Array.isArray(datasheet.conditions)
                                        ? datasheet.conditions
                                        : []
                                      const product = datasheet.product_snapshot || {}

                                      return (
                                        <div
                                          key={datasheet.id}
                                          className="rounded-2xl border border-white/10 bg-black/15 p-4"
                                        >
                                          <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">
                                                {formatDateTime(datasheet.created_at)}
                                              </p>
                                              <h4 className="mt-1 text-base font-black text-white">
                                                {datasheet.product_code || "Product not recorded"}
                                              </h4>
                                              <p className="mt-1 text-sm text-gray-300">
                                                Model {datasheet.product_model || product.model || "-"} · Fluid {datasheet.selected_fluid || "-"}
                                              </p>
                                              <p className="mt-1 text-xs text-gray-400">
                                                DN {product.dn || "-"} · MWP {product.mwp || "-"} · Port {product.port || "-"} · Setting {product.setting || "-"}
                                              </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                              <span
                                                className={
                                                  datasheet.pdf_downloaded
                                                    ? "rounded-full border border-green-300/50 bg-green-500/15 px-3 py-1 text-xs font-black text-green-200"
                                                    : "rounded-full border border-amber-300/50 bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-100"
                                                }
                                              >
                                                {datasheet.pdf_downloaded ? "PDF downloaded" : "Viewed only"}
                                              </span>

                                              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-white/80">
                                                <input
                                                  type="checkbox"
                                                  checked={Boolean(datasheet.followed_up)}
                                                  disabled={savingActivityId === datasheet.id}
                                                  onChange={(event) =>
                                                    updateDatasheetFollowUp(
                                                      datasheet.id,
                                                      event.target.checked
                                                    )
                                                  }
                                                  className="h-4 w-4 accent-[#4500E8]"
                                                />
                                                Followed up
                                              </label>
                                            </div>
                                          </div>

                                          <div className="mt-3 grid gap-2 text-xs text-gray-300 md:grid-cols-2">
                                            {conditions.length === 0 ? (
                                              <p className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                                No working condition recorded.
                                              </p>
                                            ) : (
                                              conditions.map((condition, index) => (
                                                <p
                                                  key={`${datasheet.id}-condition-${index}`}
                                                  className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                                                >
                                                  {formatCondition(condition)}
                                                </p>
                                              ))
                                            )}
                                          </div>

                                          {datasheet.followed_up && (
                                            <p className="mt-3 text-xs font-semibold text-green-200">
                                              Follow-up recorded {formatDateTime(datasheet.followed_up_at)}
                                              {datasheet.followed_up_by ? ` by ${datasheet.followed_up_by}` : ""}
                                            </p>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

"use client"

import { Fragment, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import jsPDF from "jspdf"
import { supabase } from "@/app/lib/supabase"

type ClientDatasheetActivity = {
  id: string
  created_at: string
  user_email?: string | null
  user_name?: string | null
  company?: string | null
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

function safeValue(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback
  return String(value)
}

function formatClientName(client: ClientUser) {
  return [client.first_name, client.last_name].filter(Boolean).join(" ").trim() || "Client"
}

function formatCondition(condition: Record<string, any>) {
  const id = condition.id ? `C${condition.id}` : "Condition"
  const inlet = formatNumber(condition.inletPressure, " bar")
  const outlet = formatNumber(condition.outletPressure, " bar")
  const flow = condition.flowNm3h
    ? formatNumber(condition.flowNm3h, " Nm3/h")
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
    const email = String(firstDatasheet?.user_email || "").toLowerCase().trim()
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

function downloadClientDatasheetPdf(client: ClientUser, datasheet: ClientDatasheetActivity) {
  const doc = new jsPDF("p", "mm", "a4")
  const margin = 14
  const pageWidth = 210
  const pageHeight = 297
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const product = datasheet.product_snapshot || {}
  const conditions = Array.isArray(datasheet.conditions) ? datasheet.conditions : []
  const summary = datasheet.sizing_summary || {}

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  const section = (title: string) => {
    ensureSpace(12)
    doc.setDrawColor(80, 50, 180)
    doc.setLineWidth(1.4)
    doc.line(margin, y + 2, margin + 3, y + 2)
    doc.setTextColor(22, 24, 45)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(title.toUpperCase(), margin + 6, y + 3)
    y += 9
  }

  const keyValue = (label: string, value: unknown, x: number, top: number, width: number) => {
    doc.setDrawColor(225, 228, 235)
    doc.setFillColor(248, 249, 252)
    doc.roundedRect(x, top, width, 16, 2, 2, "FD")
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(105, 113, 132)
    doc.text(label, x + 3, top + 5)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(25, 30, 45)
    doc.text(doc.splitTextToSize(safeValue(value), width - 6), x + 3, top + 11)
  }

  doc.setFillColor(248, 249, 252)
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(214, 218, 230)
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, "FD")
  doc.setDrawColor(80, 50, 180)
  doc.setLineWidth(2)
  doc.line(margin, y, margin, y + 35)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.setTextColor(22, 24, 45)
  doc.text("PRISM CLIENT DATASHEET", margin + 7, y + 11)
  doc.setFontSize(8)
  doc.setTextColor(95, 102, 120)
  doc.text("Admin copy with client details and recorded working conditions", margin + 7, y + 17)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(35, 38, 70)
  doc.text(safeValue(datasheet.product_code, "Product not recorded"), margin + 7, y + 25)
  doc.setTextColor(80, 50, 180)
  doc.text(`MODEL ${safeValue(datasheet.product_model || product.model)}`, pageWidth - margin - 35, y + 15)
  y += 44

  section("Client information")
  const col = (contentWidth - 6) / 3
  keyValue("Name", formatClientName(client), margin, y, col)
  keyValue("Company", client.company, margin + col + 3, y, col)
  keyValue("Email", client.email, margin + (col + 3) * 2, y, col)
  y += 22

  section("Product and sizing summary")
  const cardW = (contentWidth - 9) / 4
  keyValue("Fluid", datasheet.selected_fluid, margin, y, cardW)
  keyValue("DN", product.dn, margin + cardW + 3, y, cardW)
  keyValue("MWP", product.mwp, margin + (cardW + 3) * 2, y, cardW)
  keyValue("Port", product.port, margin + (cardW + 3) * 3, y, cardW)
  y += 20
  keyValue("Setting", product.setting || summary.setting, margin, y, cardW)
  keyValue("Regulation", product.regulation || summary.regulation, margin + cardW + 3, y, cardW)
  keyValue("Required seat", summary.requiredSeat || summary.seatRequired || product.seat, margin + (cardW + 3) * 2, y, cardW)
  keyValue("PDF status", datasheet.pdf_downloaded ? "Downloaded" : "Viewed only", margin + (cardW + 3) * 3, y, cardW)
  y += 24

  section("Application working conditions")
  if (conditions.length === 0) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(95, 102, 120)
    doc.text("No working condition recorded.", margin, y)
    y += 8
  } else {
    const rowH = 10
    const cols = [22, 32, 32, 32, 32, 30]
    const headers = ["Cond.", "Inlet", "Outlet", "Flow", "Temp.", "Util."]
    ensureSpace(rowH * (conditions.length + 1) + 8)
    doc.setFillColor(235, 238, 246)
    doc.rect(margin, y, contentWidth, rowH, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.setTextColor(35, 38, 70)
    let x = margin + 2
    headers.forEach((header, index) => {
      doc.text(header, x, y + 6)
      x += cols[index]
    })
    y += rowH

    doc.setFont("helvetica", "normal")
    doc.setTextColor(40, 45, 60)
    conditions.forEach((condition, index) => {
      ensureSpace(rowH + 5)
      if (index % 2 === 0) {
        doc.setFillColor(250, 251, 253)
        doc.rect(margin, y, contentWidth, rowH, "F")
      }
      x = margin + 2
      const values = [
        `C${condition.id || index + 1}`,
        formatNumber(condition.inletPressure, " bar"),
        formatNumber(condition.outletPressure, " bar"),
        condition.flowNm3h
          ? formatNumber(condition.flowNm3h, " Nm3/h")
          : formatNumber(condition.flowRateGs, " g/s"),
        formatNumber(condition.temperature, " C"),
        condition.utilizationPercent ? formatNumber(condition.utilizationPercent, "%") : "-",
      ]
      values.forEach((value, valueIndex) => {
        doc.text(value, x, y + 6)
        x += cols[valueIndex]
      })
      y += rowH
    })
    y += 6
  }

  section("Commercial tracking")
  keyValue("Viewed date", formatDateTime(datasheet.created_at), margin, y, cardW)
  keyValue("Datasheet", datasheet.pdf_downloaded ? "Downloaded" : "Viewed only", margin + cardW + 3, y, cardW)
  keyValue("Follow-up", datasheet.followed_up ? "Done" : "To do", margin + (cardW + 3) * 2, y, cardW)
  keyValue("Follow-up by", datasheet.followed_up_by || "-", margin + (cardW + 3) * 3, y, cardW)

  const safeCode = safeValue(datasheet.product_code || datasheet.product_model, "prism-datasheet")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .toLowerCase()
  doc.save(`${safeCode}-${client.email || "client"}.pdf`)
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
  const [selectedDatasheet, setSelectedDatasheet] = useState<{
    client: ClientUser
    datasheet: ClientDatasheetActivity
  } | null>(null)

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

    setSelectedDatasheet((current) => {
      if (!current || current.datasheet.id !== result.activity.id) return current
      return { ...current, datasheet: result.activity }
    })
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
                Click a client to open a scrollable activity history, view datasheets in a modal, download admin copies, and track follow-up.
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
                                      Scrollable history. Each line can be opened without expanding the page.
                                    </p>
                                  </div>
                                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-white/70">
                                    {client.search_count || 0} searches · {datasheets.length} datasheets
                                  </span>
                                </div>

                                {datasheets.length === 0 ? (
                                  <p className="text-sm text-gray-300">No datasheet viewed yet.</p>
                                ) : (
                                  <div className="max-h-[560px] space-y-3 overflow-y-auto pr-2">
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

                                            <div className="flex flex-wrap items-center justify-end gap-2">
                                              <button
                                                type="button"
                                                onClick={() => setSelectedDatasheet({ client, datasheet })}
                                                className="rounded-full border border-blue-300/50 bg-blue-500/15 px-3 py-1 text-xs font-black text-blue-100 hover:bg-blue-500/25"
                                              >
                                                See datasheet
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() => downloadClientDatasheetPdf(client, datasheet)}
                                                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black text-white hover:bg-white/20"
                                              >
                                                Download
                                              </button>

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
                                              conditions.slice(0, 4).map((condition, index) => (
                                                <p
                                                  key={`${datasheet.id}-condition-${index}`}
                                                  className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                                                >
                                                  {formatCondition(condition)}
                                                </p>
                                              ))
                                            )}
                                          </div>

                                          {conditions.length > 4 && (
                                            <p className="mt-2 text-xs font-semibold text-white/45">
                                              +{conditions.length - 4} additional condition(s). Open datasheet to view all.
                                            </p>
                                          )}

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

      {selectedDatasheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-[#11132e] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-white/45">
                  Client datasheet preview
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  {selectedDatasheet.datasheet.product_code || "Product not recorded"}
                </h3>
                <p className="mt-1 text-sm text-gray-300">
                  {formatClientName(selectedDatasheet.client)} · {selectedDatasheet.client.company} · {selectedDatasheet.client.email}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => downloadClientDatasheetPdf(selectedDatasheet.client, selectedDatasheet.datasheet)}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDatasheet(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl font-black text-white hover:bg-white/20"
                  aria-label="Close datasheet preview"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="max-h-[calc(92vh-94px)] overflow-y-auto p-5">
              {(() => {
                const datasheet = selectedDatasheet.datasheet
                const client = selectedDatasheet.client
                const product = datasheet.product_snapshot || {}
                const conditions = Array.isArray(datasheet.conditions) ? datasheet.conditions : []
                const summary = datasheet.sizing_summary || {}

                return (
                  <div className="rounded-3xl border border-white/10 bg-white p-6 text-slate-900">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                            PRISM admin datasheet
                          </p>
                          <h4 className="mt-2 text-2xl font-black text-slate-950">
                            {datasheet.product_code || "Product not recorded"}
                          </h4>
                          <p className="mt-1 text-sm font-semibold text-slate-600">
                            Model {datasheet.product_model || product.model || "-"} · Viewed {formatDateTime(datasheet.created_at)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-violet-200 bg-white px-5 py-3 text-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</p>
                          <p className="mt-1 text-sm font-black text-violet-700">
                            {datasheet.pdf_downloaded ? "Downloaded" : "Viewed only"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-black uppercase text-slate-500">Client</p>
                        <p className="mt-2 font-black">{formatClientName(client)}</p>
                        <p className="text-sm text-slate-600">{client.company}</p>
                        <p className="text-sm text-slate-600">{client.email}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-black uppercase text-slate-500">Product</p>
                        <p className="mt-2 text-sm font-bold">DN {product.dn || "-"}</p>
                        <p className="text-sm font-bold">MWP {product.mwp || "-"}</p>
                        <p className="text-sm font-bold">Port {product.port || "-"}</p>
                        <p className="text-sm font-bold">Setting {product.setting || "-"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-black uppercase text-slate-500">Sizing</p>
                        <p className="mt-2 text-sm font-bold">Fluid {datasheet.selected_fluid || "-"}</p>
                        <p className="text-sm font-bold">Required seat {safeValue(summary.requiredSeat || summary.seatRequired)}</p>
                        <p className="text-sm font-bold">Required port {safeValue(summary.requiredPort || summary.portRequired)}</p>
                        <p className="text-sm font-bold">Matches {safeValue(datasheet.matching_products_count)}</p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h5 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">
                          Working conditions
                        </h5>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                          {conditions.length} condition(s)
                        </span>
                      </div>

                      {conditions.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500">No working condition recorded.</p>
                      ) : (
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full min-w-[720px] text-left text-sm">
                            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                              <tr>
                                <th className="p-3">Condition</th>
                                <th className="p-3">Inlet pressure</th>
                                <th className="p-3">Outlet pressure</th>
                                <th className="p-3">Flow</th>
                                <th className="p-3">Temperature</th>
                                <th className="p-3">Utilization</th>
                              </tr>
                            </thead>
                            <tbody>
                              {conditions.map((condition, index) => (
                                <tr key={`${datasheet.id}-modal-condition-${index}`} className="border-t border-slate-200">
                                  <td className="p-3 font-black">C{condition.id || index + 1}</td>
                                  <td className="p-3">{formatNumber(condition.inletPressure, " bar")}</td>
                                  <td className="p-3">{formatNumber(condition.outletPressure, " bar")}</td>
                                  <td className="p-3">
                                    {condition.flowNm3h
                                      ? formatNumber(condition.flowNm3h, " Nm3/h")
                                      : formatNumber(condition.flowRateGs, " g/s")}
                                  </td>
                                  <td className="p-3">{formatNumber(condition.temperature, " °C")}</td>
                                  <td className="p-3">{condition.utilizationPercent ? formatNumber(condition.utilizationPercent, "%") : "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                      <h5 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">
                        Commercial follow-up
                      </h5>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <span className="rounded-full bg-slate-100 px-3 py-2 font-bold text-slate-700">
                          {datasheet.pdf_downloaded ? "PDF downloaded" : "Viewed only"}
                        </span>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-3 py-2 font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(datasheet.followed_up)}
                            disabled={savingActivityId === datasheet.id}
                            onChange={(event) => updateDatasheetFollowUp(datasheet.id, event.target.checked)}
                            className="h-4 w-4 accent-[#4500E8]"
                          />
                          Followed up
                        </label>
                        {datasheet.followed_up && (
                          <span className="text-sm font-semibold text-green-700">
                            Recorded {formatDateTime(datasheet.followed_up_at)}
                            {datasheet.followed_up_by ? ` by ${datasheet.followed_up_by}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

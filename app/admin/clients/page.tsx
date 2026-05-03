"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/app/lib/supabase"

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
}

export default function AdminClientsPage() {
  const router = useRouter()

  const [clients, setClients] = useState<ClientUser[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)

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
    setLoading(true)

    const token = await getAccessToken()

    if (!token) {
      router.push("/admin/login")
      return
    }

    const response = await fetch("/api/admin/clients", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    const result = await response.json()
    setLoading(false)

    if (!response.ok) {
      setMessage(result.error || "Unable to load clients")
      return
    }

    setClients(result.clients || [])
  }

  async function updateClientAccess(updatedClient: ClientUser) {
    setMessage("")
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
      setMessage(result.error || "Unable to update client")
      return
    }

    setClients((current) =>
      current.map((item) => (item.id === result.client.id ? result.client : item))
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
                Manage PRISM client accounts, price visibility, and distributor status.
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
          <div className="admin-alert admin-alert-error mb-6">
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
                By default, clients can view prices. Distributor clients will see distributor pricing only.
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
                    <th className="p-3">Price access</th>
                    <th className="p-3">Client type</th>
                    <th className="p-3">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-t border-white/10">
                      <td className="p-3 font-bold">
                        {client.first_name} {client.last_name}
                      </td>

                      <td className="p-3">{client.company}</td>

                      <td className="p-3">{client.email}</td>

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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
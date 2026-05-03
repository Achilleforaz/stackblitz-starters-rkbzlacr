"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/app/lib/supabase"

type AdminUser = {
  id: string
  email: string
  role: "admin" | "superadmin"
  is_active: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()

  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdmins()
  }, [])

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.access_token || null
  }

  async function loadAdmins() {
    setLoading(true)
    setMessage("")

    const token = await getAccessToken()

    if (!token) {
      router.push("/admin/login")
      return
    }

    const response = await fetch("/api/admin/admins", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    const result = await response.json()
    setLoading(false)

    if (!response.ok) {
      setMessage(result.error || "Unable to load admins")
      return
    }

    setAdmins(result.admins || [])
  }

  async function deleteAdmin(email: string) {
    const ok = window.confirm(`Delete admin ${email}?`)
    if (!ok) return

    const token = await getAccessToken()

    if (!token) {
      router.push("/admin/login")
      return
    }

    const response = await fetch("/api/admin/admins", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: "delete_admin",
        email,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      setMessage(result.error || "Unable to delete admin")
      return
    }

    setAdmins((current) => current.filter((admin) => admin.email !== email))
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <main className="admin-page min-h-screen p-5 text-white md:p-8">
      <div className="admin-shell mx-auto max-w-[1800px]">
        <header className="admin-header admin-header-compact admin-header-horizontal mb-6">
          <div className="admin-header-layout">
            <div className="admin-header-title">
              <p className="admin-kicker">IMF</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Admin users</h1>
              <p className="mt-2 text-sm font-semibold text-white/60">
                Manage administrator accounts and access.
              </p>
            </div>

            <nav className="admin-nav-row" aria-label="Admin navigation">
              <a href="/prism" className="admin-nav-button admin-nav-button-muted">
                Open PRISM
              </a>
              <a href="/admin" className="admin-nav-button admin-nav-button-muted">
                Catalog
              </a>
              <a href="/admin/clients" className="admin-nav-button admin-nav-button-muted">
                Clients
              </a>
              <a href="/admin/distributor-discounts" className="admin-nav-button admin-nav-button-muted">
                Discounts
              </a>
              <a href="/admin/admins" className="admin-nav-button admin-nav-button-active">
                Admin users
              </a>
              <button onClick={logout} className="admin-nav-button admin-nav-button-logout">
                Logout
              </button>
            </nav>
          </div>
        </header>

        {message && (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-red-500/20 p-4 text-red-200">
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              className="rounded bg-red-500/30 px-3 py-1 text-sm font-bold"
            >
              Close
            </button>
          </div>
        )}

        {loading ? (
          <p>Loading admins...</p>
        ) : (
          <div className="overflow-hidden rounded-3xl bg-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-t border-white/10">
                    <td className="p-4 font-semibold">{admin.email}</td>
                    <td className="p-4">{admin.role}</td>
                    <td className="p-4">
                      {admin.is_active ? "Active" : "Inactive"}
                    </td>
                    <td className="p-4">
                      {admin.created_at
                        ? new Date(admin.created_at).toLocaleDateString("fr-FR")
                        : "-"}
                    </td>
                    <td className="p-4 text-right">
                      {admin.role === "superadmin" ? (
                        <span className="text-gray-400">Protected</span>
                      ) : (
                        <button
                          onClick={() => deleteAdmin(admin.email)}
                          className="rounded-xl bg-red-600 px-4 py-2 font-bold hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {admins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-300">
                      No admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/app/lib/supabase"

type AdminUser = {
  id: string
  email: string
  role: "admin" | "superadmin"
  is_active: boolean
  created_at: string
}

export default function AdminsPage() {
  const router = useRouter()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdmins()
  }, [])

  async function getToken() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || null
  }

  async function loadAdmins() {
    const token = await getToken()

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
    const token = await getToken()
    if (!token) return

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

  return (
    <main className="min-h-screen bg-[#171838] p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm tracking-[0.4em] text-[#FF4A4A]">IMF</p>
            <h1 className="text-5xl font-black">Admin users</h1>
          </div>

          <Link href="/admin" className="rounded-xl bg-white/10 px-4 py-2 font-bold">
            Back to admin
          </Link>
        </header>

        {message && (
          <div className="mb-6 rounded-xl bg-red-500/20 p-4 text-red-200">
            {message}
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-hidden rounded-3xl bg-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Active</th>
                  <th className="p-4">Created</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-t border-white/10">
                    <td className="p-4">{admin.email}</td>
                    <td className="p-4">{admin.role}</td>
                    <td className="p-4">{admin.is_active ? "Yes" : "No"}</td>
                    <td className="p-4">
                      {new Date(admin.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-4 text-right">
                      {admin.role !== "superadmin" && (
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
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/app/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function login() {
    setMessage("")
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    if (!data.session?.access_token) {
      setMessage("Login succeeded but no session was created.")
      setLoading(false)
      return
    }

    window.location.href = "/prism"
  }

  return (
    <main className="admin-login-page admin-login-prism-bg min-h-screen text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-5 py-8">
        <section className="w-full max-w-[500px]">
          <div className="admin-login-card admin-login-card-clean">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="admin-logo-mark admin-logo-mark-small">∞</div>
                <div>
                  <div className="text-3xl font-black leading-none tracking-tight">IMF</div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-[0.26em] text-white/50">
                    PRISM Back Office
                  </div>
                </div>
              </div>

              <Link href="/prism" className="admin-login-link">
                Open PRISM
              </Link>
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight">
              Welcome
              <span className="admin-gradient-text block">back.</span>
            </h1>

            <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-white/62">
              Connect to manage catalog access, client pricing and distributor discounts.
            </p>

            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/55">
                  Email
                </span>
                <input
                  type="email"
                  className="admin-input w-full"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@imf-fluid.com"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/55">
                  Password
                </span>
                <input
                  type="password"
                  className="admin-input w-full"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") login()
                  }}
                  placeholder="••••••••"
                />
              </label>
            </div>

            {message && (
              <div className="mt-5 rounded-2xl border border-[#FF4A4A]/35 bg-[#FF4A4A]/15 p-4 text-sm font-semibold text-red-100">
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={login}
              disabled={loading}
              className="admin-primary-button mt-7 w-full"
            >
              {loading ? "Connecting..." : "Login"}
            </button>

            <div className="mt-6 text-center text-sm font-semibold text-white/55">
              Need access?{` `}
              <Link href="/create-account" className="font-black text-white underline decoration-[#FF4A4A] underline-offset-4">
                Create account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

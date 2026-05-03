"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/app/lib/supabase"

export default function CreateAccountPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [company, setCompany] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function createAccount() {
    setMessage("")
    setLoading(true)

    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()
    const cleanCompany = company.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanFirstName || !cleanLastName || !cleanCompany || !cleanEmail || !password) {
      setMessage("All fields are required.")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.")
      setLoading(false)
      return
    }

    const response = await fetch("/api/client/signup", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        company: cleanCompany,
        email: cleanEmail,
        password,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      setMessage(result.error || "Unable to create account.")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) {
      setMessage("Account created. Please login with your email and password.")
      setLoading(false)
      router.push("/admin/login")
      return
    }

    setLoading(false)
    router.push("/prism")
  }

  return (
    <main className="min-h-screen bg-[#171838] p-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl">
          <div className="mb-8">
            <p className="text-sm tracking-[0.4em] text-[#FF4A4A]">IMF</p>
            <h1 className="mt-2 text-5xl font-black">Create account</h1>
            <p className="mt-3 text-sm text-gray-300">
              Create a client account to request and display PRISM prices.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-300">
                First name
              </span>
              <input
                type="text"
                className="w-full rounded-xl border border-white/10 bg-white p-3 text-black outline-none focus:border-blue-400"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-300">
                Last name
              </span>
              <input
                type="text"
                className="w-full rounded-xl border border-white/10 bg-white p-3 text-black outline-none focus:border-blue-400"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-gray-300">
                Company
              </span>
              <input
                type="text"
                className="w-full rounded-xl border border-white/10 bg-white p-3 text-black outline-none focus:border-blue-400"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-300">
                Email
              </span>
              <input
                type="email"
                className="w-full rounded-xl border border-white/10 bg-white p-3 text-black outline-none focus:border-blue-400"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-300">
                Password
              </span>
              <input
                type="password"
                className="w-full rounded-xl border border-white/10 bg-white p-3 text-black outline-none focus:border-blue-400"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") createAccount()
                }}
              />
            </label>
          </div>

          {message && (
            <div className="mt-5 rounded-xl bg-red-500/20 p-3 text-sm text-red-100">
              {message}
            </div>
          )}

          <button
            onClick={createAccount}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#4500E8] to-[#FF4A4A] p-3 font-bold transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <div className="mt-6 space-y-3 text-center text-sm text-gray-300">
            <p>
              Already have an account?{" "}
              <Link
                href="/admin/login"
                className="font-bold text-white underline decoration-[#FF4A4A]"
              >
                Login
              </Link>
            </p>

            <Link
              href="/prism"
              className="inline-block font-semibold text-gray-300 hover:text-white"
            >
              Back to PRISM
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
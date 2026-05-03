import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const body = await request.json()

  const firstName = String(body.firstName || "").trim()
  const lastName = String(body.lastName || "").trim()
  const company = String(body.company || "").trim()
  const email = String(body.email || "").trim().toLowerCase()
  const password = String(body.password || "")

  if (!firstName || !lastName || !company || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Missing Supabase environment variables." }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 })
  }

  const session = signUpData.session

  if (!session?.access_token) {
    return NextResponse.json({
      success: true,
      message: "Account created. Please confirm your email, then login.",
    })
  }

  const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        authorization: `Bearer ${session.access_token}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: client, error: profileError } = await authenticatedClient.rpc(
    "create_client_profile_after_signup",
    {
      p_first_name: firstName,
      p_last_name: lastName,
      p_company: company,
    }
  )

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, client })
}
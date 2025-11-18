import { NextResponse } from "next/server"
import { getAuthHeaders } from "@lib/data/cookies"

export async function GET() {
  try {
    const headers = await getAuthHeaders()
    if (!headers || !("authorization" in headers) || !headers.authorization) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
    }

    const res = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/customers/me`, {
      headers: {
        ...headers,
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()
    const customer = data.customer || data
    return NextResponse.json({
      first_name: customer.first_name || null,
      last_name: customer.last_name || null,
      email: customer.email || null,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 })
  }
}

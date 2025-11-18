import { NextResponse } from "next/server"
import { getAuthHeaders } from "@lib/data/cookies"

export async function POST() {
  try {
    const headers = await getAuthHeaders()

    if (!headers || !("authorization" in headers) || !headers.authorization) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
    }

    const backendBase = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL
    if (!backendBase) {
      return NextResponse.json({ error: 'Backend URL non configurato' }, { status: 500 })
    }

    const upstream = await fetch(`${backendBase}/store/customers/me/wishlist/share-token`, {
      method: 'POST',
      headers: {
        ...headers,
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const text = await upstream.text()
    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, { status: upstream.status })
    } catch {
      return new NextResponse(text, { status: upstream.status })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 })
  }
}

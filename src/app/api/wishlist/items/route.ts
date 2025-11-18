import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { getAuthHeaders } from "@lib/data/cookies"

export async function POST(req: Request) {
  try {
    const headers = await getAuthHeaders()
    // Log diagnostico (solo dev): sapere se abbiamo il token
    if (process.env.NODE_ENV !== 'production') {
      console.log("[api/wishlist/items] hasAuth:", !!(headers as any).authorization)
    }

    if (!headers || !("authorization" in headers) || !headers.authorization) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
    }

    const body = await req.json().catch(() => null) as {
      productId?: string
      productVariantId?: string
      quantity?: number
    } | null

    if (!body || !body.productId || !body.productVariantId) {
      return NextResponse.json({ error: "Missing productId/productVariantId" }, { status: 400 })
    }

    const quantity = typeof body.quantity === 'number' && body.quantity > 0 ? body.quantity : 1

    const backendBase = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL
    if (!backendBase) {
      return NextResponse.json({ error: 'Backend URL non configurato' }, { status: 500 })
    }

    const upstream = await fetch(`${backendBase}/store/customers/me/wishlist/items`, {
      method: 'POST',
      headers: {
        ...headers,
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: body.productId,
        productVariantId: body.productVariantId,
        quantity,
      }),
      cache: 'no-store',
    })

    const text = await upstream.text()
    if (process.env.NODE_ENV !== 'production') {
      console.log("[api/wishlist/items] upstream status:", upstream.status)
      if (!upstream.ok) console.log("[api/wishlist/items] upstream body:", text)
    }

    // Revalidate wishlist cache tag on success
    if (upstream.ok) {
      try {
        revalidateTag("wishlist")
      } catch {}
    }

    // Try to return JSON if possible, else return text
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

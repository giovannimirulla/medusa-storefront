import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { getAuthHeaders } from "@lib/data/cookies"

export async function DELETE(
  _req: Request,
  { params }: { params: { productId: string; productVariantId: string } }
) {
  try {
    const headers = await getAuthHeaders()

    if (!headers || !("authorization" in headers) || !headers.authorization) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
    }

    const { productId, productVariantId } = params

    if (!productId || !productVariantId) {
      return NextResponse.json({ error: "Missing productId/productVariantId" }, { status: 400 })
    }

    const backendBase = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL
    if (!backendBase) {
      return NextResponse.json({ error: 'Backend URL non configurato' }, { status: 500 })
    }

    const upstream = await fetch(
      `${backendBase}/store/customers/me/wishlist/items/${productId}/${productVariantId}`,
      {
        method: 'DELETE',
        headers: {
          ...headers,
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    const text = await upstream.text()

    // Revalidate wishlist cache tag on success
    if (upstream.ok) {
      try {
        revalidateTag("wishlist")
      } catch {}
    }

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

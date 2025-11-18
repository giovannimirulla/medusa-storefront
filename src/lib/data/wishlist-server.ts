"use server"

import { getAuthHeaders } from "./cookies"
import type { Wishlist } from "./wishlist"

export async function getCustomerWishlistServer(): Promise<Wishlist | null> {
  const headers = await getAuthHeaders()
  if (!headers || !("authorization" in headers) || !headers.authorization) {
    return null
  }
  try {
    const response = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/customers/me/wishlist`, {
      headers: {
        ...headers,
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
        'Content-Type': 'application/json',
      },
      next: { tags: ["wishlist"] },
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.wishlist
  } catch {
    return null
  }
}

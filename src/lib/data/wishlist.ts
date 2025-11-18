// Nota: questo file contiene sia utilità lato server che lato client.
// NON usare "use server" qui, altrimenti le funzioni importate nei client component
// verrebbero trattate come server actions e non avrebbero accesso ai cookie del browser.

import { cache } from "react"

export type WishlistItem = {
  id: string
  productId: string
  productVariantId: string
  quantity: number
  created_at: string
  updated_at: string
}

export type Wishlist = {
  id: string
  customer_id: string
  items: WishlistItem[]
  created_at: string
  updated_at: string
}

/**
 * Get customer's wishlist
 */
export const getCustomerWishlist = cache(async function (): Promise<Wishlist | null> {
  // Usa il proxy API anche lato server per evitare dipendenze server-only qui
  try {
    const res = await fetch("/api/wishlist", { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data?.wishlist || null
  } catch (e) {
    return null
  }
})

/**
 * Add item to wishlist
 */
export async function addToWishlist(productId: string, productVariantId: string, quantity: number = 1) {
  // Usa sempre il proxy API: funziona sia client che server e gestisce i cookie httpOnly
  const response = await fetch(`/api/wishlist/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, productVariantId, quantity }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[addToWishlist] (proxy) Error ${response.status}:`, errorText)
    throw new Error(`Failed to add item to wishlist: ${response.status}`)
  }
  return response.json()
}

/**
 * Remove item from wishlist
 */
export async function removeFromWishlist(productId: string, productVariantId: string) {
  const response = await fetch(`/api/wishlist/items/${productId}/${productVariantId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[removeFromWishlist] (proxy) Error ${response.status}:`, errorText)
    throw new Error("Failed to remove item from wishlist")
  }
  return response.json()
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(productId: string, productVariantId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/wishlist', { cache: 'no-store' })
    if (!res.ok) return false
    const data = await res.json()
    const wishlist: Wishlist | null = data?.wishlist || null
    if (!wishlist || !wishlist.items) return false
    return wishlist.items.some((item) => item.productId === productId && item.productVariantId === productVariantId)
  } catch {
    return false
  }
}

/**
 * Get wishlist share token
 */
export async function getWishlistShareToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/wishlist/share-token', { method: 'POST' })
    if (!res.ok) return null
    const data = await res.json()
    return data?.shared_token || null
  } catch {
    return null
  }
}

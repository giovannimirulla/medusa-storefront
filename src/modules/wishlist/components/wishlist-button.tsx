"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { addToWishlist, removeFromWishlist } from "@lib/data/wishlist"
import { Button } from "@medusajs/ui"

type WishlistButtonProps = {
  productId: string
  productVariantId: string
  isInWishlist?: boolean
  className?: string
}

export default function WishlistButton({
  productId,
  productVariantId,
  isInWishlist = false,
  className = "",
}: WishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(isInWishlist)
  const [loading, setLoading] = useState(false)

  // Update local state when prop changes (e.g., variant selection)
  useEffect(() => {
    setInWishlist(isInWishlist)
  }, [isInWishlist])

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (inWishlist) {
        await removeFromWishlist(productId, productVariantId)
        setInWishlist(false)
      } else {
        await addToWishlist(productId, productVariantId)
        setInWishlist(true)
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error)
      alert("Devi effettuare l'accesso per usare la wishlist")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="secondary"
      onClick={handleToggle}
      disabled={loading}
      className={className}
    >
      <Heart
        className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`}
      />
    </Button>
  )
}

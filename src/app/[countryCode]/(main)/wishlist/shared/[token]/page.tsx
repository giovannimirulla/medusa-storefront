import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { listProducts } from "@lib/data/products"
import { formatAmount } from "@lib/util/format-price"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Wishlist Condivisa",
  description: "Visualizza la wishlist condivisa",
}

type Props = {
  params: Promise<{ countryCode: string; token: string }>
  searchParams?: Promise<{ owner?: string }>
}

// Fetch shared wishlist using the token parameter
async function getSharedWishlist(token: string) {
  try {
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/wishlists?token=${token}`,
      {
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      console.error(`Failed to fetch shared wishlist: ${response.status}`)
      return null
    }

  const data = await response.json()
  return data || null
  } catch (error) {
    console.error("Error fetching shared wishlist:", error)
    return null
  }
}

export default async function SharedWishlistPage({ params, searchParams }: Props) {
  const { countryCode, token } = await params
  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  const data = await getSharedWishlist(token)
  const wishlist = data?.wishlist
  const customer = data?.customer
  if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
    return (
      <div className="content-container py-12">
        <div className="flex flex-col gap-y-8 max-w-4xl mx-auto">
          <Heading level="h1" className="text-3xl font-bold">
            Wishlist non trovata
          </Heading>
          <Text>Questa wishlist non esiste o non è più disponibile.</Text>
          <LocalizedClientLink href="/" className="text-blue-600 hover:underline">
            Torna alla home
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  // Fetch product details for wishlist items (fix: use productId)
  const productIds = wishlist.items.map((item: any) => item.productId)
  const { response } = await listProducts({
    countryCode,
    queryParams: {
      id: productIds,
    },
  })
  const products = response.products

  // Nome utente: preferisci "Nome Cognome", altrimenti email, fallback "Utente"
  const first = customer?.first_name?.trim()
  const last = customer?.last_name?.trim()
  const fullName = [first, last].filter(Boolean).join(" ")
  const customerName = fullName || customer?.email || "Utente"

  return (
    <div className="content-container py-12">
      <div className="flex flex-col gap-y-8 max-w-6xl mx-auto">
        <div>
          <Heading level="h1" className="text-3xl font-bold mb-4">
            Wishlist di {customerName}
          </Heading>
          <Text className="text-lg text-gray-600">
            {wishlist.items.length} {wishlist.items.length === 1 ? "prodotto" : "prodotti"}
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.items.map((item: any) => {
            const product = products.find((p: any) => p.id === item.productId)
            if (!product) return null
            const variant = product.variants?.find((v: any) => v.id === item.productVariantId) || product.variants?.[0]

            return (
              <LocalizedClientLink
                key={item.id}
                href={`/products/${product.handle}`}
                className="group"
              >
                <div className="flex flex-col">
                  <Thumbnail
                    thumbnail={product.thumbnail}
                    size="square"
                    className="w-full group-hover:opacity-75 transition-opacity"
                  />
                  <div className="mt-4">
                    <Text className="font-medium group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </Text>
                    {variant?.calculated_price?.calculated_amount && (
                      <Text className="text-sm text-gray-600 mt-1">
                        {formatAmount(variant.calculated_price.calculated_amount, region.currency_code)}
                      </Text>
                    )}
                  </div>
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <LocalizedClientLink 
            href="/" 
            className="inline-block text-blue-600 hover:underline"
          >
            Scopri altri prodotti →
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

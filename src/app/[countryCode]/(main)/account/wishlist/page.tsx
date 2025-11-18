import { Metadata } from "next"
import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import { getCustomerWishlistServer as getCustomerWishlist } from "@lib/data/wishlist-server"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { Heading, Text } from "@medusajs/ui"
import { formatAmount } from "@lib/util/format-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { removeFromWishlist } from "@lib/data/wishlist"
import { Trash2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Wishlist",
  description: "I tuoi prodotti preferiti",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function WishlistPage({ params }: Props) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)
  
  if (!region) {
    notFound()
  }

  const wishlist = await getCustomerWishlist()

  if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
    return (
      <div className="flex flex-col gap-y-8 w-full">
        <div>
          <Heading level="h1" className="text-2xl-semi mb-4">
            La tua Wishlist
          </Heading>
          <Text>La tua wishlist è vuota</Text>
        </div>
      </div>
    )
  }

  // Fetch product details for wishlist items
  const productIds = wishlist.items.map(item => item.productId)
  const { response } = await listProducts({
    countryCode,
    queryParams: {
      id: productIds,
    },
  })

  const products = response.products

  return (
    <div className="flex flex-col gap-y-8 w-full">
      <div>
        <Heading level="h1" className="text-2xl-semi mb-4">
          La tua Wishlist
        </Heading>
        <Text>
          {wishlist.items.length} {wishlist.items.length === 1 ? "prodotto" : "prodotti"}
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.items.map((item) => {
          const product = products.find(p => p.id === item.productId)
          if (!product) return null
          const variant = product.variants?.find(v => v.id === item.productVariantId) || product.variants?.[0]

          return (
            <div key={item.id} className="group relative">
              <LocalizedClientLink
                href={`/products/${product.handle}`}
                className="flex flex-col"
              >
                <Thumbnail
                  thumbnail={product.thumbnail}
                  size="square"
                  className="w-full"
                />
                <div className="mt-4">
                  <Text className="font-medium">{product.title}</Text>
                  {variant?.calculated_price?.calculated_amount && (
                    <Text className="text-sm text-gray-600">
                      {formatAmount(variant.calculated_price.calculated_amount, region.currency_code)}
                    </Text>
                  )}
                </div>
              </LocalizedClientLink>
              
              <form
                action={async () => {
                  "use server"
                  await removeFromWishlist(item.productId, item.productVariantId)
                  revalidatePath(`/${countryCode}/account/wishlist`)
                }}
                className="absolute top-2 right-2"
              >
                <button
                  type="submit"
                  className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </form>
            </div>
          )
        })}
      </div>
    </div>
  )
}

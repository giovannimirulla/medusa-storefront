import { listProducts } from "@lib/data/products"
import { isInWishlist } from "@lib/data/wishlist"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const product = await listProducts({
    queryParams: { id: [id] },
    regionId: region.id,
  }).then(({ response }) => response.products[0])

  if (!product) {
    return null
  }

  // Check if product is in wishlist (only if user is logged in)
  let inWishlist = false
  if (product.variants && product.variants.length > 0) {
    try {
      inWishlist = await isInWishlist(product.id, product.variants[0].id)
    } catch (error) {
      // User not logged in or error checking wishlist
      inWishlist = false
    }
  }

  return <ProductActions product={product} region={region} isInWishlist={inWishlist} />
}

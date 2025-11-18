import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ReviewsList from "@modules/reviews/components/reviews-list"
import ReviewForm from "@modules/reviews/components/review-form"
import ReviewStats from "@modules/reviews/components/review-stats"
import { getProductReviews, getProductReviewStats } from "@lib/data/reviews"
import { Heading } from "@medusajs/ui"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = async ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  // Fetch reviews and stats
  const reviews = await getProductReviews(product.id)
  const reviewStats = await getProductReviewStats(product.id)

  return (
    <>
      <div
        className="content-container  flex flex-col small:flex-row small:items-start py-6 relative"
        data-testid="product-container"
      >
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>
        <div className="block w-full relative">
          <ImageGallery images={images} />
        </div>
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-12">
          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>
        </div>
      </div>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
      
      {/* Reviews Section */}
      <div className="content-container my-16 small:my-32">
        <Heading level="h2" className="text-3xl font-bold mb-8">
          Recensioni
        </Heading>
        
        <ReviewStats stats={reviewStats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div>
            <Heading level="h3" className="text-2xl font-semibold mb-6">
              Tutte le recensioni
            </Heading>
            <ReviewsList reviews={reviews} />
          </div>
          
          <div className="lg:sticky lg:top-24 h-fit">
            <ReviewForm productId={product.id} />
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductTemplate

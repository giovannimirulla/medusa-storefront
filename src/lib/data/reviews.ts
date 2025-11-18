"use server"

import { getAuthHeaders } from "./cookies"
import { cache } from "react"

export type OrderLineItem = {
  id: string
  product_id: string
  variant_id: string
  title: string
  quantity: number
}

export type CustomerOrder = {
  id: string
  status: string
  created_at: string
  items: OrderLineItem[]
}

export type ProductReview = {
  id: string
  product_id: string
  customer_id?: string
  customer?: {
    id: string
    first_name: string
    last_name: string
  }
  rating: number
  title: string
  content: string
  approved: boolean
  created_at: string
  updated_at: string
}

export type ProductReviewStats = {
  product_id: string
  average_rating: number
  total_reviews: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

/**
 * Get reviews for a product
 */
export const getProductReviews = cache(async function (productId: string): Promise<ProductReview[]> {
  try {
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/product-reviews?product_id=${productId}`,
      {
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
          'Content-Type': 'application/json',
        },
        next: {
          tags: [`reviews:${productId}`],
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.product_reviews || []
  } catch (error) {
    console.error("Error fetching product reviews:", error)
    return []
  }
})

/**
 * Get review statistics for a product
 */
export const getProductReviewStats = cache(async function (productId: string): Promise<ProductReviewStats | null> {
  try {
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/product-review-stats?product_id=${productId}`,
      {
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
          'Content-Type': 'application/json',
        },
        next: {
          tags: [`review-stats:${productId}`],
        },
      }
    )

    if (!response.ok) {
      return null
    }

  const data = await response.json()
  return (data.product_review_stats && data.product_review_stats[0]) || null
  } catch (error) {
    console.error("Error fetching review stats:", error)
    return null
  }
})

/**
 * Get customer orders that contain a specific product
 */
export async function getCustomerOrdersForProduct(productId: string): Promise<CustomerOrder[]> {
  const headers = await getAuthHeaders()

  if (!headers || !("authorization" in headers) || !headers.authorization) {
    return []
  }

  try {
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/customers/me/orders`,
      {
        headers: {
          ...headers,
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const orders: CustomerOrder[] = data.orders || []

    // Filter orders that contain the product and are completed
    return orders.filter(order => 
      order.status === 'completed' &&
      order.items?.some((item: OrderLineItem) => item.product_id === productId)
    )
  } catch (error) {
    console.error("Error fetching customer orders:", error)
    return []
  }
}

/**
 * Create a product review
 * Note: Reviews must be associated with an order and order line item
 */
export async function createProductReview(
  orderId: string,
  orderLineItemId: string,
  rating: number,
  content: string
) {
  const headers = await getAuthHeaders()

  if (!headers || !("authorization" in headers) || !headers.authorization) {
    throw new Error("Not authenticated")
  }

  const response = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/product-reviews`, {
    method: 'POST',
    headers: {
        ...headers,
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reviews: [
        {
          order_id: orderId,
          order_line_item_id: orderLineItemId,
          rating,
          content,
          images: [],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[createProductReview] Error ${response.status}:`, errorText)
    throw new Error(`Failed to create review: ${response.status}`)
  }

  return response.json()
}

/**
 * Update a product review
 */
export async function updateProductReview(
  reviewId: string,
  rating: number,
  title: string,
  content: string
) {
  const headers = await getAuthHeaders()

  if (!headers || !("authorization" in headers) || !headers.authorization) {
    throw new Error("Not authenticated")
  }

  const response = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/product-reviews`, {
    method: 'POST',
    headers: {
      ...headers,
      'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reviews: [
        {
          id: reviewId,
          rating,
          content,
          images: [],
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to update review")
  }

  return response.json()
}

/**
 * Delete a product review
 */
export async function deleteProductReview(reviewId: string) {
  const headers = await getAuthHeaders()

  if (!headers || !("authorization" in headers) || !headers.authorization) {
    throw new Error("Not authenticated")
  }

  const response = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/product-reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      ...headers,
      'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error("Failed to delete review")
  }

  return response.json()
}

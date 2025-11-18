"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { ProductReview } from "@lib/data/reviews"
import { Button, Heading, Text } from "@medusajs/ui"

type ReviewsListProps = {
  reviews: ProductReview[]
}

export default function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        Nessuna recensione ancora. Sii il primo a recensire questo prodotto!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-b-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <Text className="text-sm font-medium">
              {review.customer
                ? `${review.customer.first_name} ${review.customer.last_name}`
                : "Cliente"}
            </Text>
          </div>
          <Heading level="h3" className="text-lg font-semibold mb-2">
            {review.title}
          </Heading>
          <Text className="text-gray-700 mb-2">{review.content}</Text>
          <Text className="text-sm text-gray-500">
            {new Date(review.created_at).toLocaleDateString("it-IT")}
          </Text>
        </div>
      ))}
    </div>
  )
}

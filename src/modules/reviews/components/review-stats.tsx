"use client"

import { Star } from "lucide-react"
import { ProductReviewStats } from "@lib/data/reviews"
import { Text } from "@medusajs/ui"

type ReviewStatsProps = {
  stats: ProductReviewStats | null
}

export default function ReviewStats({ stats }: ReviewStatsProps) {
  if (!stats || stats.total_reviews === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex items-center gap-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < Math.round(stats.average_rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <Text className="font-semibold">
          {stats.average_rating.toFixed(1)}
        </Text>
      </div>
      <Text className="text-sm text-gray-600">
        ({stats.total_reviews} {stats.total_reviews === 1 ? "recensione" : "recensioni"})
      </Text>
    </div>
  )
}

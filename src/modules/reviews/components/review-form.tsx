"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { createProductReview, getCustomerOrdersForProduct, type CustomerOrder, type OrderLineItem } from "@lib/data/reviews"
import { Button, Heading, Label, Textarea, Select } from "@medusajs/ui"

type ReviewFormProps = {
  productId: string
  onSuccess?: () => void
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState("")
  const [selectedLineItemId, setSelectedLineItemId] = useState("")
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      setLoadingOrders(true)
      try {
        const customerOrders = await getCustomerOrdersForProduct(productId)
        setOrders(customerOrders)
        
        // Auto-select first order and line item if available
        if (customerOrders.length > 0) {
          const firstOrder = customerOrders[0]
          setSelectedOrderId(firstOrder.id)
          const lineItem = firstOrder.items.find((item: OrderLineItem) => item.product_id === productId)
          if (lineItem) {
            setSelectedLineItemId(lineItem.id)
          }
        }
      } catch (error) {
        console.error("Error loading orders:", error)
      } finally {
        setLoadingOrders(false)
      }
    }
    
    loadOrders()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedOrderId || !selectedLineItemId) {
      alert("Devi selezionare un ordine valido per lasciare una recensione.")
      return
    }
    
    setLoading(true)

    try {
      await createProductReview(selectedOrderId, selectedLineItemId, rating, content)
      setContent("")
      setRating(5)
      alert("Recensione inviata con successo! Sarà visibile dopo l'approvazione.")
      onSuccess?.()
    } catch (error) {
      console.error("Failed to submit review:", error)
      alert("Errore nell'invio della recensione. Assicurati di aver effettuato l'accesso.")
    } finally {
      setLoading(false)
    }
  }

  if (loadingOrders) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Caricamento...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-2">Devi acquistare questo prodotto per lasciare una recensione.</p>
        <p className="text-sm text-gray-500">Solo i clienti verificati possono recensire i prodotti.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Heading level="h3" className="text-xl font-semibold mb-4">
        Scrivi una recensione
      </Heading>

      <div>
        <Label>Ordine</Label>
        <Select
          value={selectedOrderId}
          onValueChange={(value) => {
            setSelectedOrderId(value)
            const order = orders.find(o => o.id === value)
            if (order) {
              const lineItem = order.items.find((item: OrderLineItem) => item.product_id === productId)
              if (lineItem) {
                setSelectedLineItemId(lineItem.id)
              }
            }
          }}
        >
          <Select.Trigger className="w-full mt-2">
            <Select.Value placeholder="Seleziona un ordine" />
          </Select.Trigger>
          <Select.Content>
            {orders.map((order) => (
              <Select.Item key={order.id} value={order.id}>
                Ordine del {new Date(order.created_at).toLocaleDateString('it-IT')}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      <div>
        <Label>Valutazione</Label>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="content">Recensione</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="Condividi i tuoi pensieri sul prodotto"
          rows={5}
          className="mt-2"
        />
      </div>

      <Button type="submit" disabled={loading || !selectedOrderId || !selectedLineItemId} className="w-full">
        {loading ? "Invio..." : "Invia recensione"}
      </Button>
    </form>
  )
}

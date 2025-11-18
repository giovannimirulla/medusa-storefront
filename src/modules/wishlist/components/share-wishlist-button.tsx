"use client"

import { useState } from "react"
import { Share2, Copy, Check } from "lucide-react"
import { Button, Text } from "@medusajs/ui"
// il token viene ottenuto tramite il proxy API

export default function ShareWishlistButton() {
  const [shareUrl, setShareUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  const handleShare = async () => {
    setLoading(true)
    try {
  const resp = await fetch('/api/wishlist/share-token', { method: 'POST' })
  const { shared_token: token } = resp.ok ? await resp.json() : { shared_token: null }
      if (token) {
        const segments = window.location.pathname.split("/").filter(Boolean)
        const countryCode = segments[0] || "it"
        const url = `${window.location.origin}/${countryCode}/wishlist/shared/${token}`
        setShareUrl(url)
        setShowShareDialog(true)
      } else {
        alert("Impossibile generare il link di condivisione. Assicurati di aver effettuato l'accesso.")
      }
    } catch (error) {
      console.error("Failed to generate share link:", error)
      alert("Errore nella generazione del link di condivisione.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleShare}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Condividi Wishlist
      </Button>

      {showShareDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <Text className="text-lg font-semibold">Condividi la tua Wishlist</Text>
              <button
                onClick={() => setShowShareDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <Text className="text-sm text-gray-600 mb-4">
              Copia questo link per condividere la tua wishlist con amici e familiari:
            </Text>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <Button
                variant="secondary"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copiato!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copia
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="primary"
              onClick={() => setShowShareDialog(false)}
              className="w-full"
            >
              Chiudi
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

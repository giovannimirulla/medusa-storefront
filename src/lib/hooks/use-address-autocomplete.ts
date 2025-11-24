import { useState, useCallback, useEffect } from "react"
import { debounce } from "lodash"

interface AddressResult {
  id: string
  display_name: string
  address_line1: string
  address_line2?: string
  city: string
  postal_code: string
  province?: string
  country_code: string
  latitude: number
  longitude: number
}

interface UseAddressAutocompleteProps {
  countryCode?: string
  onSelect?: (address: AddressResult) => void
}

export const useAddressAutocomplete = ({
  countryCode = "IT",
  onSelect,
}: UseAddressAutocompleteProps) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AddressResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchAddress = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 3) {
        setResults([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        
        const response = await fetch(`${backendUrl}/store/address/autocomplete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": publishableKey || "",
          },
          body: JSON.stringify({
            query: searchTerm,
            countryCode: countryCode,
            limit: 5,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch address suggestions")
        }

        const data = await response.json()
        const addressResults = data.addresses || []
        setResults(addressResults)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [countryCode]
  )

  // Debounce la ricerca per evitare troppe chiamate API
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      searchAddress(searchTerm)
    }, 300),
    [searchAddress]
  )

  useEffect(() => {
    debouncedSearch(query)
    
    return () => {
      debouncedSearch.cancel()
    }
  }, [query, debouncedSearch])

  const selectAddress = useCallback(
    (address: AddressResult) => {
      if (onSelect) {
        onSelect(address)
      }
      setQuery("")
      setResults([])
    },
    [onSelect]
  )

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    selectAddress,
    clearResults: () => setResults([]),
  }
}

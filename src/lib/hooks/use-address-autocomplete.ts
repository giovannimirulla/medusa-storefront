import { useState, useCallback, useEffect } from "react"
import { debounce } from "lodash"

interface LocalityResult {
  cap: string
  locality: string
  StateOrProvinceCode: string
  iso_code: string
  latitude?: number
  longitude?: number
}

interface UseAddressAutocompleteProps {
  countryCode?: string
  onSelect?: (locality: LocalityResult) => void
}

export const useAddressAutocomplete = ({
  countryCode = "IT",
  onSelect,
}: UseAddressAutocompleteProps) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<LocalityResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchLocality = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 3) {
        setResults([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Chiamata all'API del backend Medusa
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const response = await fetch(`${backendUrl}/store/paccofacile/locality/validation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            iso_code: countryCode,
            search: searchTerm,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch locality suggestions")
        }

        const data = await response.json()
        
        // L'API del plugin restituisce { localities: [...] }
        const resultsArray = data.localities || []
        setResults(resultsArray)
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
      searchLocality(searchTerm)
    }, 300),
    [searchLocality]
  )

  useEffect(() => {
    debouncedSearch(query)
    
    return () => {
      debouncedSearch.cancel()
    }
  }, [query, debouncedSearch])

  const selectLocality = useCallback(
    (locality: LocalityResult) => {
      if (onSelect) {
        onSelect(locality)
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
    selectLocality,
    clearResults: () => setResults([]),
  }
}

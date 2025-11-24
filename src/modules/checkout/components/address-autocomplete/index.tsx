import React, { useRef, useEffect } from "react"
import { Spinner } from "@medusajs/icons"
import Input from "@modules/common/components/input"

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

interface AddressAutocompleteProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelect: (address: AddressResult) => void
  results: AddressResult[]
  isLoading: boolean
  error: string | null
  placeholder?: string
  required?: boolean
  autoComplete?: string
  "data-testid"?: string
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label,
  name,
  value,
  onChange,
  onSelect,
  results,
  isLoading,
  error,
  placeholder,
  required,
  autoComplete,
  "data-testid": dataTestId,
}) => {
  const [showResults, setShowResults] = React.useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Chiudi i risultati quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e)
    setShowResults(true)
  }

  const handleSelectAddress = (address: AddressResult) => {
    onSelect(address)
    setShowResults(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        label={label}
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowResults(true)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        data-testid={dataTestId}
      />

      {showResults && (results.length > 0 || isLoading || error) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Spinner className="animate-spin" />
              <span className="ml-2 text-sm text-gray-600">
                Searching...
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <ul className="py-1">
              {results.map((address, index) => (
                <li
                  key={`${address.id}-${index}`}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleSelectAddress(address)}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {address.display_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {address.address_line1} - {address.postal_code} {address.city}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && !error && results.length === 0 && value.length >= 3 && (
            <div className="p-4 text-sm text-gray-600">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AddressAutocomplete

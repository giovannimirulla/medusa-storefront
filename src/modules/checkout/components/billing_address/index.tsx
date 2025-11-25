import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import React, { useState } from "react"
import CountrySelect from "../country-select"
import AddressAutocomplete from "../address-autocomplete"
import { useAddressAutocomplete } from "@lib/hooks/use-address-autocomplete"

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const [formData, setFormData] = useState<any>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.address_2": cart?.billing_address?.address_2 || "",
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.country_code": cart?.billing_address?.country_code || "",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": cart?.billing_address?.phone || "",
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Hook per l'autocomplete della località usando PaccoFacile (solo per ricerca sopra form)
  const {
    query: addressQuery,
    setQuery: setAddressQuery,
    results: addressResults,
    isLoading: isAddressLoading,
    error: addressError,
  } = useAddressAutocomplete({
    regionId: cart?.region_id,
    onSelect: (address) => {
      setFormData({
        ...formData,
        "billing_address.address_1": address.address || "",
        "billing_address.address_2": address.building_number || "",
        "billing_address.city": address.city || "",
        "billing_address.postal_code": address.postal_code || "",
        "billing_address.province": address.province || "",
        "billing_address.country_code": address.country_code?.toLowerCase() || "",
      })
    },
  })

  return (
    <>
      {/* Campo autocomplete indirizzo sopra il form */}
      <div className="mb-6 flex flex-col gap-y-4">
        <p className="text-small-regular font-semibold">
          Search and autofill address
        </p>
        <AddressAutocomplete
          label="Search address"
          name="address_search"
          autoComplete="off"
          value={addressQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressQuery(e.target.value)}
          onSelect={(address: any) => {
            setFormData({
              ...formData,
              "billing_address.address_1": address.address || "",
              "billing_address.address_2": address.building_number || "",
              "billing_address.city": address.city,
              "billing_address.postal_code": address.postal_code,
              "billing_address.province": address.province || "",
              "billing_address.country_code": address.country_code.toLowerCase(),
            })
            setAddressQuery("")
          }}
          results={addressResults}
          isLoading={isAddressLoading}
          error={addressError}
          placeholder="Type an address (e.g., Via Roma 10, Milano...)"
          data-testid="address-search-autocomplete"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          name="billing_address.first_name"
          autoComplete="given-name"
          value={formData["billing_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="billing-first-name-input"
        />
        <Input
          label="Last name"
          name="billing_address.last_name"
          autoComplete="family-name"
          value={formData["billing_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="billing-last-name-input"
        />
        <Input
          label="Address"
          name="billing_address.address_1"
          autoComplete="address-line1"
          value={formData["billing_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="billing-address-input"
        />
        <Input
          label="Numero civico"
          name="billing_address.address_2"
          autoComplete="address-line2"
          value={formData["billing_address.address_2"]}
          onChange={handleChange}
          required
          data-testid="billing-address-2-input"
        />
        <Input
          label="Company"
          name="billing_address.company"
          value={formData["billing_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="billing-company-input"
        />
        <Input
          label="Postal code"
          name="billing_address.postal_code"
          autoComplete="postal-code"
          value={formData["billing_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="billing-postal-input"
        />
        <Input
          label="City"
          name="billing_address.city"
          autoComplete="address-level2"
          value={formData["billing_address.city"]}
          onChange={handleChange}
          required
          data-testid="billing-city-input"
        />
        <CountrySelect
          name="billing_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["billing_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="billing-country-select"
        />
        <Input
          label="State / Province"
          name="billing_address.province"
          autoComplete="address-level1"
          value={formData["billing_address.province"]}
          onChange={handleChange}
          data-testid="billing-province-input"
        />
        <Input
          label="Phone"
          name="billing_address.phone"
          autoComplete="tel"
          value={formData["billing_address.phone"]}
          onChange={handleChange}
          data-testid="billing-phone-input"
        />
      </div>
    </>
  )
}

export default BillingAddress
